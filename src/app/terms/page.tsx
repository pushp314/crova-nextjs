import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-20 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">⚖️ Terms & Conditions</h1>
        <p className="text-muted-foreground">Last Updated: November 2025</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="text-lg mb-8">
          Welcome to Crova! By using our website — <strong>www.crova.in</strong> — you agree to the following terms. 
          Please read them carefully.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. General</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Crova is an Indian clothing brand owned and operated by Rashmeet Kaur & Harshleen Suri.
              When you browse or purchase from our website, you agree to follow our terms, policies, and community standards.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. Products & Custom Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Each Crova piece is embroidered and finished with care. Slight variations in color or design are 
              part of our handmade process and not considered defects.
            </p>
            <p className="font-semibold">
              Custom orders are made specifically for you and are non-returnable unless damaged or incorrect.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Pricing & Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices are listed in INR and include applicable taxes.</li>
              <li>Payments are securely processed through trusted payment gateways.</li>
              <li>Prices may change without prior notice.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. Shipping & Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>We aim to dispatch orders within <strong>7-10 working days</strong>.</li>
              <li>Delivery timelines may vary based on location.</li>
              <li>You'll receive tracking details once your order is shipped.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. Returns & Exchanges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              We accept returns for damaged or defective products within <strong>7 days of delivery</strong>.
            </p>
            <p>
              To request a return, please contact us at <a href="mailto:support@crova.in" className="text-primary hover:underline">support@crova.in</a> with your order details and photos of the item.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              All designs, photos, and content on this site belong to Crova.
              Any unauthorized use, reproduction, or distribution is strictly prohibited.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Crova will not be responsible for any indirect, incidental, or consequential damages 
              arising from the use of our products or website.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>8. Updates to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We may update these terms from time to time. The latest version will always be available on this page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">For any queries, reach us at:</p>
            <div className="space-y-2">
              <p>📧 <a href="mailto:hello@crova.in" className="text-primary hover:underline">hello@crova.in</a></p>
              <p>📞 <a href="tel:+918770266546" className="text-primary hover:underline">+91 8770266546</a></p>
              <p className="mt-4 text-muted-foreground">
                🏠 Crova Studio<br />
                Bhilai, Chhattisgarh<br />
                India
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
