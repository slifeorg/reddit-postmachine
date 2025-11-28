// Copyright (c) 2025, AndrewM and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Subreddit Template", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('Subreddit Template', {
    refresh: function(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__('Generate Post (AI)'), function() {
                
                frappe.call({
                    method: 'reddit_postmachine.reddit_postmachine.doctype.subreddit_template.subreddit_template.generate_post_from_template',
                    args: {
                        template_name: frm.doc.name
                    },
                    freeze: true,
                    freeze_message: __("Asking OpenAI to generate content..."),
                    callback: function(r) {
                        if (r.message && r.message.status === 'success') {
                            frappe.msgprint({
                                title: __('Success'),
                                indicator: 'green',
                                message: __('Post created: ') + `<a href="/app/reddit-post/${r.message.post_name}">${r.message.post_name}</a>`
                            });
                        }
                    }
                });

            }).addClass('btn-primary');
        }
    }
});