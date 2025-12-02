frappe.ui.form.on('Reddit Post', {
    refresh: function(frm) {
        // 1. Показуємо кнопку ЗАВЖДИ, якщо статус дозволяє (або якщо це новий документ)
        if (frm.doc.docstatus === 0 && (frm.is_new() || ['Created', 'Draft'].includes(frm.doc.status))) {
            
            frm.add_custom_button(__('Generate from Template (AI)'), function() {
                
                // Перевірка, чи вибрано шаблон
                if (!frm.doc.template_used) {
                    frappe.msgprint({
                        title: __('Attention'),
                        message: __('Please select a <b>Template Used</b> first.'),
                        indicator: 'orange'
                    });
                    return;
                }

                // Виклик API
                frappe.call({
                    method: 'reddit_postmachine.reddit_postmachine.doctype.reddit_post.reddit_post.generate_content_from_template',
                    args: {
                        template_name: frm.doc.template_used
                    },
                    freeze: true,
                    freeze_message: __('🤖 AI is writing your post...'),
                    
                    callback: async function(r) {
                        if (r.message && r.message.status === 'success') {
                            const data = r.message.data;

                            // Заповнюємо поля по черзі
                            await frm.set_value('title', data.title);
                            await frm.set_value('post_type', data.post_type);
                            await frm.set_value('url_to_share', data.url_to_share);
                            await frm.set_value('body_text', data.body_text);
                            await frm.set_value('hashtags', data.hashtags);
                            await frm.set_value('subreddit_name', data.subreddit_name);
                            await frm.set_value('subreddit_group', data.subreddit_group);
                            
                            // Встановлюємо Account (якщо знайдено)
                            if (data.account) {
                                await frm.set_value('account', data.account);
                            }
                            
                            // Ставимо статус
                            await frm.set_value('status', 'Created');

                            // Виводимо повідомлення
                            frappe.show_alert({message: __('Content Generated!'), indicator: 'green'});

                            // Спроба зберегти, тільки якщо Акаунт заповнено
                            if (frm.doc.account) {
                                frm.save();
                            } else {
                                frappe.msgprint({
                                    title: __('Almost done'),
                                    message: __('Content created, but <b>no Account selected</b> automatically. Please select an Account and click Save.'),
                                    indicator: 'orange'
                                });
                            }

                        } else {
                            frappe.msgprint({
                                title: __('Error'),
                                message: r.message ? r.message.error_message : 'Unknown server error',
                                indicator: 'red'
                            });
                        }
                    }
                });

            }).addClass('btn-primary');
        }
    }
});