import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 md:py-20 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">🛡️ Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: November 2025</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="text-lg mb-8">
          At Crova, we value your privacy and are committed to protecting your personal information.
          This policy explains how we collect, use, and protect your data when you visit our website — <strong>www.crova.in</strong>
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We may collect the following details when you interact with us:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your name, email address, phone number, and shipping address when you place an order.</li>
              <li>Payment details (handled securely by our payment partners).</li>
              <li>Data from cookies to improve your browsing experience.</li>
            </ul>
            <p className="font-semibold">
              We do not store your payment card details. All transactions are processed through secure payment gateways.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and deliver your orders.</li>
              <li>Keep you updated about your purchase.</li>
              <li>Improve our website, services, and user experience.</li>
              <li>Send you special offers or updates (only if you subscribe).</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We take appropriate steps to keep your personal data secure and private.
              Your data is never sold, rented, or shared with third parties, except where required for 
              order fulfillment (like shipping or payment).
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>4. Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our website uses cookies to help us understand how you interact with our pages. 
              You can disable cookies in your browser settings if you prefer.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3">You can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your stored data.</li>
              <li>Ask us to correct or delete your data.</li>
              <li>Unsubscribe from promotional emails anytime.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">If you have any questions about this policy, please reach out at:</p>
            <div className="space-y-2">
              <p>📧 <a href="mailto:hello@crova.in" className="text-primary hover:underline">hello@crova.in</a></p>
              <p className="mt-4">Or write to us at:</p>
              <p className="text-muted-foreground">
                Crova Studio<br />
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
