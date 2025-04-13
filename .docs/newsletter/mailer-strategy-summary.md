# Master Strategy: Subscriber Tracking & Segmentation (MailerLite + MailerSend)

---

## 📆 GOAL

Create a reliable and scalable system to:

- Track all meaningful user actions (newsletter signup, tools downloaded, calls booked, email sent/received)
- Maintain language preferences
- Automate custom sequences
- Keep clear, segmented lists for personal weekly newsletters, tools delivery, and conversion tracking

---

## ⚖️ TERMINOLOGY USED

- **Field (custom field)** = persistent property of the subscriber (e.g. language, name, client status)
- **Group** = manually or automatically managed tag that shows an action or event (e.g. downloaded tool X, booked a free consultation)
- **Segment** = smart/dynamic group based on field values or group memberships, used for targeting (e.g. all EN speakers who downloaded tool Y)

---

## 🌐 LANGUAGE MANAGEMENT

| Label | Type | Description |
|-------|------|-------------|
| `language` | Field | Persistent field (`it`, `en`). Set by the form or QR code source. Used for sending content in the correct language |

---

## ✍️ NEWSLETTER SIGNUPS

| Label | Type | Description |
|-------|------|-------------|
| `newsletter_it` | Group | Joined from Italian footer form. Triggers weekly Italian newsletter. |
| `newsletter_en` | Group | Joined from English footer form. Triggers weekly English newsletter. |

---

### 📦 TOOL DOWNLOADS (LEAD MAGNETS)

For each tool, create a group with the tool name and track language using `language` field.

| Label | Type | Description |
|-------|------|-------------|
| `download_toolname_x` | Group | Added when user downloads specific tool (e.g. pricing canvas, checklist, etc.). |

---

## 📅 CALENDAR BOOKINGS

| Label | Type | Description |
|-------|------|-------------|
| `booked_call` | Group | For standard booked calls (via Calendly/Zapier). |
| `booked_free_consultation` | Group | For free discovery sessions (via Calendly/Zapier). |

---

## 👤 RELATIONSHIP / STATUS

| Label | Type | Description |
|-------|------|-------------|
| `customer` | Field | Boolean or `yes/no`. Set manually or via workflow. |
| `ex_customer` | Field | Optional. Use for reactivation campaigns. |
| `prospect` | Group | Added when person shows interest but hasn’t booked or purchased. |

---

## 🚌 QR CODE TRACKING (e.g. business card download)

| Label | Type | Description |
|-------|------|-------------|
| `scanned_qr_businesscard` | Group | Tracked via QR redirect or form with UTM. Triggers welcome email or follow-up. |

---

## ✉️ EMAIL CONTACTS (manual or inbound)

| Label | Type | Description |
|-------|------|-------------|
| `sent_manual_email` | Group | Marked via Zapier or custom event when you email someone manually. |
| `contacted_by_email` | Group | Someone who wrote to you directly and you want to enter into flow. |

---

## 🔄 SEGMENTS TO BUILD

| Segment Name | Logic |
|--------------|--------|
| `weekly_newsletter_it` | `language = it` + `group: newsletter_it` |
| `weekly_newsletter_en` | `language = en` + `group: newsletter_en` |
| `tool_x_english_users` | `language = en` + `group: download_toolname_x` |
| `tool_x_italian_clients` | `language = it` + `group: download_toolname_x` + `field: client = yes` |
| `non_clients_engaged` | `field: client = no` + `group in (any tool, any call)` |

---

## 🔧 TOOLS TO USE

- **MailerLite**: forms, groups, segments, fields, automations
- **MailerSend**: triggered sequences, language-based templates
- **Zapier/Make**: to sync Calendly, QR, inbox, CRM, or other external events
- **Google Tag Manager / UTM**: QR code tracking, lead source attribution

---

## 🔍 MAINTENANCE STRATEGY

- Review and clean groups every quarter
- Sync fields with MailerSend for correct template usage
- Automate key events like QR scans, Calendly bookings, and email parsing with Zapier

---

Let me know if you want this turned into a visual map or Airtable-style board.
