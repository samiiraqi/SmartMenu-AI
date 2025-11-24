# ============================================
# WAF - Web Application Firewall
# ============================================
# This creates security rules to protect your app:
# - SQL Injection protection
# - XSS protection
# - Rate limiting (DDoS protection)
# - Bot control
# - Geographic blocking (optional)
# ============================================

# -----------------------------------------
# WAF WEB ACL (Main Firewall)
# -----------------------------------------

resource "aws_wafv2_web_acl" "main" {
  count = var.waf_enabled ? 1 : 0

  name        = "${var.project_name}-waf"
  description = "WAF for ${var.project_name}"
  scope       = "REGIONAL"  # For ALB (use CLOUDFRONT for CloudFront CDN)

  # Default action: ALLOW traffic (block only specific threats)
  default_action {
    allow {}
  }

  # -----------------------------------------
  # RULE 1: AWS Managed Core Rule Set
  # -----------------------------------------
  # Protects against common web exploits
  # (OWASP Top 10, etc.)

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-common-rules"
      sampled_requests_enabled   = true
    }
  }

  # -----------------------------------------
  # RULE 2: SQL Injection Protection
  # -----------------------------------------
  # Blocks attempts like: ?id=1; DROP TABLE users;--

  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-sqli-rules"
      sampled_requests_enabled   = true
    }
  }

  # -----------------------------------------
  # RULE 3: Known Bad Inputs
  # -----------------------------------------
  # Blocks known malicious patterns

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # -----------------------------------------
  # RULE 4: Rate Limiting (DDoS Protection)
  # -----------------------------------------
  # Blocks if one IP sends too many requests
  # Example: 2000 requests in 5 minutes = BLOCKED

  rule {
    name     = "RateLimitRule"
    priority = 4

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.waf_rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # -----------------------------------------
  # RULE 5: Bot Control
  # -----------------------------------------
  # Blocks bad bots but allows good bots (Google, etc.)

  rule {
    name     = "AWSManagedRulesBotControlRuleSet"
    priority = 5

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesBotControlRuleSet"
        vendor_name = "AWS"

        managed_rule_group_configs {
          aws_managed_rules_bot_control_rule_set {
            inspection_level = "COMMON"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-bot-control"
      sampled_requests_enabled   = true
    }
  }

  # -----------------------------------------
  # RULE 6: Geographic Blocking (Optional)
  # -----------------------------------------
  # Block specific countries if specified in variables

  dynamic "rule" {
    for_each = length(var.waf_block_countries) > 0 ? [1] : []

    content {
      name     = "GeoBlockRule"
      priority = 6

      action {
        block {}
      }

      statement {
        geo_match_statement {
          country_codes = var.waf_block_countries
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${var.project_name}-geo-block"
        sampled_requests_enabled   = true
      }
    }
  }

  # Visibility config for entire WAF
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "${var.project_name}-waf"
  }
}

# -----------------------------------------
# WAF LOGGING (Optional)
# -----------------------------------------
# Logs all blocked requests for analysis

resource "aws_cloudwatch_log_group" "waf" {
  count             = var.waf_enabled ? 1 : 0
  name              = "aws-waf-logs-${var.project_name}"
  retention_in_days = 30
}

resource "aws_wafv2_web_acl_logging_configuration" "main" {
  count                   = var.waf_enabled ? 1 : 0
  log_destination_configs = [aws_cloudwatch_log_group.waf[0].arn]
  resource_arn            = aws_wafv2_web_acl.main[0].arn

  # Don't log sensitive headers (privacy)
  redacted_fields {
    single_header {
      name = "authorization"
    }
  }
}
