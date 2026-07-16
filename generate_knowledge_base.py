"""
Run this script ONCE from the project root to generate all knowledge base PDFs.
Usage: python generate_knowledge_base.py
"""
import os

try:
    from fpdf import FPDF
except ImportError:
    print("Installing fpdf...")
    os.system("pip install fpdf")
    from fpdf import FPDF

os.makedirs("knowledge_base", exist_ok=True)

docs = {
    "FAQ.pdf": """TechMart Electronics - Frequently Asked Questions

Q: What is TechMart Electronics?
A: TechMart Electronics is a leading online retailer of consumer electronics offering smartphones, laptops, accessories, and smart home devices.

Q: How do I contact customer support?
A: Email: support@techmart.com | Phone: 1-800-TECH-MART | Hours: Mon-Fri 9AM-6PM EST

Q: Where are your offices located?
A: Our headquarters is at 123 Tech Avenue, San Francisco, CA 94102.

Q: Do you offer international shipping?
A: Yes, we ship to over 50 countries. International shipping takes 7-14 business days.

Q: What payment methods do you accept?
A: We accept Visa, MasterCard, American Express, PayPal, and Apple Pay.

Q: Can I cancel my order after placing it?
A: Orders can be cancelled within 2 hours of placement if not yet shipped.

Q: Do you have a loyalty program?
A: Yes! TechMart Rewards gives 1 point per $1 spent. 100 points = $1 discount.

Q: What is your price match policy?
A: We match prices from Amazon, Best Buy, and Walmart for identical items within 7 days of purchase.""",

    "RefundPolicy.pdf": """TechMart Electronics - Refund Policy

Last Updated: January 2025

1. RETURN WINDOW
Standard products: 30 days from delivery
Opened electronics: 15 days from delivery
Software and digital products: Non-refundable once activated

2. ELIGIBILITY
Items must be in original condition with all accessories, in original packaging, with proof of purchase.

3. REFUND PROCESS
Step 1: Visit techmart.com/returns and enter your order number
Step 2: Select items to return and provide reason
Step 3: Print prepaid return label
Step 4: Ship item within 7 days
Step 5: Refund processed within 5-7 business days after receipt

4. REFUND METHODS
Original payment method: Full refund
TechMart store credit: 110% of purchase price
Damaged or defective items: Immediate replacement or full refund

5. NON-RETURNABLE ITEMS
Gift cards, downloadable software, items marked Final Sale, customized items.

6. EXCHANGES
Free exchanges available for defective items within warranty period.""",

    "ShippingPolicy.pdf": """TechMart Electronics - Shipping Policy

DOMESTIC SHIPPING (USA)
Standard Shipping 5-7 days: FREE on orders over $50, else $4.99
Expedited Shipping 2-3 days: $9.99
Overnight Shipping 1 day: $19.99
Same Day Delivery select cities: $24.99

INTERNATIONAL SHIPPING
Standard International 7-14 days: $14.99 to $29.99
Express International 3-5 days: $39.99 to $59.99
Available in 50+ countries

ORDER PROCESSING
Orders placed before 2 PM EST ship same business day.
Orders placed after 2 PM EST ship next business day.
No shipping on weekends and federal holidays.

TRACKING
Tracking number provided via email within 24 hours of shipping.
Track orders at techmart.com/track.

DAMAGED PACKAGES
Report damaged packages within 48 hours of delivery.
Email photos to damage@techmart.com.
Replacement shipped within 2 business days.

FREE SHIPPING
Orders over $50 qualify for free standard shipping.
TechMart Premium members get free expedited shipping always.""",

    "Warranty.pdf": """TechMart Electronics - Warranty Policy

STANDARD WARRANTY COVERAGE

SMARTPHONES AND TABLETS: 1 year manufacturer warranty.
Covers: Manufacturing defects, hardware failures.
Does NOT cover: Physical damage, water damage, unauthorized modifications.

LAPTOPS AND COMPUTERS: 1 year manufacturer warranty plus 1 year TechMart extended warranty.
Covers: Hardware defects, battery issues below 80% capacity.
Does NOT cover: Software issues, accidental damage.

ACCESSORIES: 6 months warranty. Covers manufacturing defects only.

SMART HOME DEVICES: 1 year warranty. Includes free software updates for 2 years.

EXTENDED WARRANTY - TechMart Protect
Available for purchase within 30 days of product purchase.
Plans: 1 year $29, 2 years $49, 3 years $69.
Covers accidental damage, drops, and spills.

WARRANTY CLAIMS PROCESS
Step 1: Visit techmart.com/warranty or call 1-800-TECH-MART
Step 2: Provide order number and describe the issue
Step 3: Receive prepaid shipping label
Step 4: Ship device to our repair center
Step 5: Repaired or replaced within 7-10 business days

OUT-OF-WARRANTY REPAIRS
Diagnostic fee: $29 waived if repair is approved.
Repair quotes provided before any work begins.""",

    "Pricing.pdf": """TechMart Electronics - Product Pricing Guide 2025

SMARTPHONES
TechMart Pro X1 128GB: $699
TechMart Pro X1 256GB: $799
TechMart Lite Z1 64GB: $299
TechMart Lite Z1 128GB: $349

LAPTOPS
TechMart UltraBook 13 inch: $849
TechMart UltraBook 15 inch: $1,099
TechMart Gaming Pro 15 inch: $1,499
TechMart Gaming Pro 17 inch: $1,799
TechMart Chromebook: $399

ACCESSORIES
Wireless Earbuds Pro: $79
Wireless Earbuds Lite: $39
Smartwatch Series 3: $199
Smartwatch Series 5: $299
USB-C Hub 7-in-1: $49
Wireless Charger 15W: $29

SMART HOME
Smart Speaker Mini: $49
Smart Speaker Max: $99
Smart Display 8 inch: $129
Smart Thermostat: $149
Security Camera: $89

SUBSCRIPTION PLANS
TechMart Premium: $9.99 per month. Free expedited shipping plus 10% discount.
TechMart Pro: $19.99 per month. All Premium benefits plus priority support and extended warranty.

PRICE MATCH POLICY
We match prices from Amazon, Best Buy, and Walmart for identical items.""",

    "UserManual.pdf": """TechMart Electronics - General User Manual

GETTING STARTED

1. UNBOXING
Carefully remove device from packaging.
Items included: Device, charger, USB cable, quick start guide, warranty card.
Save original packaging for potential returns.

2. INITIAL SETUP
Step 1: Charge device to 100% before first use.
Step 2: Power on by holding power button for 3 seconds.
Step 3: Follow on-screen setup wizard.
Step 4: Connect to Wi-Fi network.
Step 5: Sign in or create TechMart account.
Step 6: Register product at techmart.com/register for warranty activation.

3. ACCOUNT MANAGEMENT
Create account at account.techmart.com.
Username: Your email address.
Password: Minimum 8 characters, 1 uppercase, 1 number.
Enable 2FA for security: Settings then Security then Two-Factor Authentication.

4. TROUBLESHOOTING

Device won't power on:
Charge for at least 30 minutes.
Hold power button for 10 seconds for force restart.
Contact support if issue persists.

Cannot connect to Wi-Fi:
Toggle Wi-Fi off and on in Settings.
Forget network and reconnect.
Check router is working.
Reset network settings if needed.

Device running slow:
Clear cache: Settings then Storage then Clear Cache.
Close background apps.
Perform factory reset as last resort.

Screen issues:
Adjust brightness: Settings then Display.
Check for software updates.
Contact warranty support for hardware screen issues.

5. SOFTWARE UPDATES
Updates delivered automatically when on Wi-Fi overnight.
Manual update: Settings then System then Software Update.
Never interrupt an update in progress.

6. FACTORY RESET
WARNING: This deletes all data. Backup first.
Settings then System then Reset then Factory Reset.
Confirm with your password."""
}

def create_pdf(filename, content):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    pdf.set_margins(15, 15, 15)
    for line in content.split('\n'):
        if line.strip() == '':
            pdf.ln(3)
        else:
            try:
                pdf.multi_cell(0, 6, txt=line)
            except Exception:
                pdf.multi_cell(0, 6, txt=line.encode('latin-1', 'replace').decode('latin-1'))
    pdf.output(f"knowledge_base/{filename}")
    print(f"Created: knowledge_base/{filename}")

if __name__ == "__main__":
    print("Generating knowledge base PDFs for TechMart Electronics...")
    for filename, content in docs.items():
        create_pdf(filename, content)
    print("\nAll knowledge base PDFs created successfully!")
    print("Files saved in: knowledge_base/")
