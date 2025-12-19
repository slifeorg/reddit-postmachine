import frappe
from frappe.model.document import Document

# Re-export key helpers for backwards compatibility (in case anything imported them from this module)
from .location_utils import extract_location_from_subreddit  # noqa: F401
from .safe_logging import log_error_safe, safe_log_append  # noqa: F401
from .title_format import (  # noqa: F401
    TitleFormatRequirements,
    TitleFormatter,
    sanitize_hashtag_token,
    strip_outer_wrappers,
)

from .post_generator import SubredditTemplatePostGenerator


class SubredditTemplate(Document):
    pass


_generator = SubredditTemplatePostGenerator()


@frappe.whitelist()
def generate_post_from_template(template_name, account_name=None, agent_name=None):
    """Generate and create a new Reddit Post document based on a Subreddit Template."""
    return _generator.generate_post_from_template(template_name, account_name=account_name, agent_name=agent_name)


@frappe.whitelist()
def generate_post_for_agent(agent_name):
    """Return a new Reddit Post for a given agent name."""
    return _generator.generate_post_for_agent(agent_name)


