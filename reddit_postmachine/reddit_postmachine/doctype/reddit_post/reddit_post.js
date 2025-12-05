frappe.ui.form.on('Reddit Post', {
    refresh: function(frm) {
        
        // --- BUTTON 1: AI GENERATION (Генерація контенту) ---
        // Показуємо, якщо документ ще не поданий (docstatus 0) і статус "Created" або це новий документ
        if (frm.doc.docstatus === 0 && (frm.is_new() || ['Created', 'Draft'].includes(frm.doc.status))) {
            
            frm.add_custom_button(__('Generate from Template (AI)'), function() {
                console.log('%c[Frappe] 🤖 AI Generation Started', 'color: orange;');
                
                if (!frm.doc.template_used) {
                    frappe.msgprint(__('Please select a <b>Template Used</b> first.'));
                    return;
                }

                frappe.call({
                    method: 'reddit_postmachine.reddit_postmachine.doctype.reddit_post.reddit_post.generate_content_from_template',
                    args: { template_name: frm.doc.template_used },
                    freeze: true,
                    freeze_message: __('🤖 AI is writing your post...'),
                    
                    callback: async function(r) {
                        if (r.message && r.message.status === 'success') {
                            console.log('[Frappe] ✅ AI Response received:', r.message.data);
                            const data = r.message.data;
                            
                            // Заповнення полів
                            await frm.set_value('title', data.title);
                            await frm.set_value('post_type', data.post_type);
                            await frm.set_value('url_to_share', data.url_to_share);
                            await frm.set_value('body_text', data.body_text);
                            await frm.set_value('hashtags', data.hashtags);
                            await frm.set_value('subreddit_name', data.subreddit_name);
                            await frm.set_value('subreddit_group', data.subreddit_group);
                            
                            if (data.account) await frm.set_value('account', data.account);
                            
                            await frm.set_value('status', 'Created');
                            frappe.show_alert({message: __('Content Generated!'), indicator: 'green'});

                            if (frm.doc.account) {
                                frm.save();
                            }
                        } else {
                            console.error('[Frappe] ❌ AI Error:', r.message);
                            frappe.msgprint({ title: __('Error'), message: r.message ? r.message.error_message : 'Unknown error', indicator: 'red' });
                        }
                    }
                });
            }).addClass('btn-primary');
        }

        // --- BUTTONS GROUP: PUBLISHING ---
        // Показуємо тільки якщо документ збережений (не новий) і статус "Created"
        if (!frm.is_new() && frm.doc.status === 'Created') {

            // --- BUTTON 2: SMART API PUBLISH (Серверна публікація через PRAW) ---
            // Це основний рекомендований метод
            frm.add_custom_button(__('🤖 Smart Publish (API)'), function() {
                
                frappe.confirm(
                    __('This will verify agent history, subreddit activity, and publish via API. Proceed?'),
                    function() {
                        frappe.call({
                            method: 'reddit_postmachine.reddit_postmachine.doctype.reddit_post.reddit_post.execute_smart_post_via_api',
                            args: { post_name: frm.doc.name },
                            freeze: true,
                            freeze_message: __('Checking Agent history & Subreddit status...'),
                            callback: function(r) {
                                // 1. Логування в консоль для дебагу
                                if(r.message.logs) {
                                    console.group("🐍 Smart Publish Server Logs");
                                    r.message.logs.forEach(l => console.log(l));
                                    console.groupEnd();
                                }

                                // 2. Обробка результату
                                if (r.message.status === 'success') {
                                    frappe.msgprint({
                                        title: __('Success'),
                                        indicator: 'green',
                                        message: __('Posted successfully! Link: ') + `<a href="${r.message.reddit_url}" target="_blank">View on Reddit</a>`
                                    });
                                    frm.reload_doc();
                                } else {
                                    // Якщо перевірки не пройшли (кулдаун або помилка)
                                    frappe.msgprint({
                                        title: __('Check Failed / Error'),
                                        indicator: 'orange',
                                        message: r.message.message || 'Unknown error occurred.'
                                    });
                                }
                            }
                        });
                    }
                );
            }).addClass('btn-danger'); // Червона кнопка для важливості


            // --- BUTTON 3: CHROME EXTENSION INTEGRATION (Клієнтська імітація) ---
            // Запасний метод або для ручних дій
            frm.add_custom_button(__('🚀 Extension Actions'), function() {
                console.log('%c[Frappe] 🚀 Opening Extension Actions Dialog', 'color: blue; font-weight: bold;');
                
                let d = new frappe.ui.Dialog({
                    title: 'Reddit Machine Extension',
                    fields: [
                        {
                            label: 'Select Action',
                            fieldname: 'action',
                            fieldtype: 'Select',
                            options: [
                                'Create Post (Fill Form Only)',
                                'Create Post (Auto Submit)',
                                'Check Stats (Go to Profile)'
                            ],
                            default: 'Create Post (Fill Form Only)'
                        }
                    ],
                    primary_action_label: 'Execute',
                    primary_action: function(values) {
                        console.log(`[Frappe] Action selected: ${values.action}`);

                        const actionMap = {
                            'Create Post (Fill Form Only)': { type: 'create_post', submit: false },
                            'Create Post (Auto Submit)': { type: 'create_post', submit: true },
                            'Check Stats (Go to Profile)': { type: 'check_stats', submit: false }
                        };
                        const selected = actionMap[values.action];

                        const fullContent = (frm.doc.body_text || "") + "\n\n" + (frm.doc.hashtags || "");

                        const payload = {
                            subreddit: frm.doc.subreddit_name,
                            account_username: frm.doc.account_username || "", 
                            title: frm.doc.title,
                            post_type: frm.doc.post_type, 
                            url: frm.doc.url_to_share,
                            content: fullContent,
                            auto_submit: selected.submit
                        };

                        console.log('[Frappe] 📦 Prepared Payload:', payload);
                        console.log('[Frappe] 📤 Sending to Extension via window.postMessage...');

                        // Відправка повідомлення в Chrome Extension
                        window.postMessage({
                            type: "FROM_FRAPPE_TO_EXTENSION",
                            command: "EXECUTE_REDDIT_ACTION",
                            actionType: selected.type,
                            data: payload
                        }, "*");

                        frappe.show_alert({
                            message: __('Command sent to Chrome Extension!'),
                            indicator: 'blue'
                        });
                        
                        d.hide();
                    }
                });
                d.show();

            }).addClass('btn-secondary');
        }
    }
});