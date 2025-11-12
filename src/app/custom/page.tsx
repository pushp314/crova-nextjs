'use client';

import { motion } from 'framer-motion';
import { Upload, Scissors, Sparkles, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function CustomPage() {
  return (
    <div className="container py-12 md:py-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <Scissors className="h-16 w-16 mx-auto mb-6 text-primary" />
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Custom Your Tee</h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Upload your idea → We embroider it → You wear your art.
        </p>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">1. Upload Your Idea</h3>
              <p className="text-muted-foreground">
                Share your design, artwork, or text. Whether it's a sketch, quote, or logo — we'll bring it to life.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Scissors className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">2. We Embroider It</h3>
              <p className="text-muted-foreground">
                Our artisans carefully embroider your design onto premium 100% cotton fabric. Every stitch is crafted with precision.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">3. Wear Your Art</h3>
              <p className="text-muted-foreground">
                Receive your one-of-a-kind tee and wear something that's uniquely yours. No mass production, just your story.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Separator className="my-16" />

      {/* What You Can Customize */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">What You Can Customize</h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Text & Quotes</h3>
              <p className="text-muted-foreground">Your favorite quote, mantra, or inside joke — embroidered in your choice of font and color.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Artwork & Sketches</h3>
              <p className="text-muted-foreground">Turn your drawings, doodles, or digital art into wearable embroidery.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Logos & Branding</h3>
              <p className="text-muted-foreground">Perfect for teams, businesses, or events. We can embroider your logo with precision.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Minimalist Designs</h3>
              <p className="text-muted-foreground">Simple symbols, initials, or patterns that speak volumes without saying much.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Separator className="my-16" />

      {/* Pricing & Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Details & Pricing</h2>
        
        <div className="max-w-3xl mx-auto">
          <Card className="bg-muted/30">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Base Price (Custom Tee)</span>
                  <span className="text-lg font-bold">₹1,299</span>
                </div>
                <Separator />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ 100% premium cotton fabric</p>
                  <p>✓ Custom embroidery (up to 4"x4" size)</p>
                  <p>✓ Choice of thread colors</p>
                  <p>✓ Hand-finished quality</p>
                  <p>✓ Production time: 7-10 working days</p>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground italic">
                  * Complex designs or larger embroidery areas may incur additional charges. We'll confirm pricing after reviewing your design.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Create Your Tee?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get in touch with us to discuss your design. We'll guide you through the process and bring your vision to life.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <a href="/contact">Contact Us</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="mailto:hello@crova.in">Email Your Design</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="https://instagram.com/crova.in" target="_blank" rel="noopener noreferrer">DM on Instagram</a>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
