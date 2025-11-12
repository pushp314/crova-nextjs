'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart, Users, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">🧵 The Crova Story</h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Two sisters. One dream. A table full of threads.
        </p>
      </motion.div>

      {/* Main Story */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-4xl mx-auto mb-20"
      >
        <div className="prose prose-lg mx-auto">
          <p className="text-xl md:text-2xl font-semibold text-center mb-8">
            That's how Crova began.
            <br />
            Legacy doesn't scream. It shows up.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            Crova was born from a bond — not business.
            From two sisters, <strong>Rashmeet Kaur</strong> and <strong>Harshleen Suri</strong>, who wanted to turn emotions into art.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            It began on random video calls — where ideas turned into sketches, and sketches turned into threads.
            We didn't have a factory, a big team, or investors.
            What we had was a vision — to build something real, something that felt.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            So we started from our home in Bhilai, with a single embroidery machine and endless belief.
            Slowly, stitch by stitch, Crova came alive — not as a clothing brand, but as a reflection of us.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            Every Crova tee is designed, embroidered, and finished at our Crova Studio, where creativity meets craft.
            We don't chase trends.
            We chase truth — in color, in fabric, and in the stories our threads tell.
          </p>

          <p className="text-xl font-semibold text-center mt-12">
            Crova isn't about being loud.
            <br />
            It's about being real.
          </p>
        </div>
      </motion.div>

      <Separator className="my-16" />

      {/* What Makes Us Different */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
          🌿 What Makes Us Different
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-8 pb-8">
              <Sparkles className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">✨ We Stitch, We Don't Print.</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our embroidery is crafted to last — each design is made to feel personal, textured, and timeless.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 pb-8">
              <Heart className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">🧶 Every Piece is Hand-Finished.</h3>
              <p className="text-muted-foreground leading-relaxed">
                From fabric cutting to tag placement — everything is done under our eyes at Crova Studio. Nothing mass-produced, nothing rushed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 pb-8">
              <Sparkles className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">💭 Emotion Over Trend.</h3>
              <p className="text-muted-foreground leading-relaxed">
                We don't follow fast fashion. We follow moments — designs that hold meaning, not marketing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-8 pb-8">
              <Users className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">👭 A Sister-Run Studio.</h3>
              <p className="text-muted-foreground leading-relaxed">
                Crova is powered by two sisters who dream, design, and decide together. Every drop you see has been lived, felt, and stitched by us.
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="pt-8 pb-8">
              <Home className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-3">🌱 Rooted in Bhilai, Dreaming Beyond.</h3>
              <p className="text-muted-foreground leading-relaxed">
                What started in our hometown now travels across India — carrying a piece of Bhilai warmth in every package.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Separator className="my-16" />

      {/* Our Founders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
          🧵 Our Founders
        </h2>
        <p className="text-xl text-center text-muted-foreground mb-16">
          Two sisters. One dream. A story stitched in thread.
        </p>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Rashmeet Kaur */}
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-6xl">👩‍🎨</div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Rashmeet Kaur</h3>
              <p className="text-lg text-primary font-semibold mb-4">The Visionary</p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The creative mind behind Crova's identity. Rashmeet blends art, storytelling, and detail into every design. 
                She leads the brand's voice, direction, and overall aesthetic — ensuring that every tee speaks quietly but powerfully.
              </p>
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "For me, every thread carries emotion — it's a way to say something without saying it out loud."
                <span className="block mt-2 not-italic font-semibold">— Rashmeet</span>
              </blockquote>
            </CardContent>
          </Card>

          {/* Harshleen Suri */}
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-6xl">🧵</div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Harshleen Suri</h3>
              <p className="text-lg text-primary font-semibold mb-4">The Craftsmith</p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Harshleen is the precision and process behind Crova's embroidery. She handles the technical flow, production, 
                and the quality that defines every Crova piece. Her patience, perfection, and love for fine detail bring Rashmeet's ideas to life — stitch by stitch.
              </p>
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "Our designs may be small, but every one of them holds a piece of us."
                <span className="block mt-2 not-italic font-semibold">— Harshleen</span>
              </blockquote>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-xl md:text-2xl font-semibold mb-4">
            💫 Together, They Built Crova
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            What started as two sisters dreaming over video calls is now a full-fledged studio in Bhilai, 
            where every color, thread, and tag carries their touch.
          </p>
          <p className="text-lg text-muted-foreground italic">
            Crova isn't a label. It's a legacy of emotion — passed from their hearts to yours.
          </p>
        </div>
      </motion.div>

      {/* Our Promise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Card className="max-w-3xl mx-auto bg-primary/5 border-2">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">💌 Our Promise</h2>
            <p className="text-lg leading-relaxed mb-4">
              We believe that what you wear should speak quietly but stay forever.
              Crova is for those who love meaning in the details — who don't shout to be seen, but still get noticed.
            </p>
            <p className="text-xl font-semibold">
              Because legacy isn't loud — it's stitched.
            </p>
            <div className="mt-8">
              <p className="font-semibold">— Rashmeet & Harshleen</p>
              <p className="text-muted-foreground">Founders, Crova</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inside the Studio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          🌿 Inside the Studio
        </h2>
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-center mb-6">Every Crova piece is:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg">
              <span className="text-green-600">✔</span>
              <span>Designed in-house</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-green-600">✔</span>
              <span>Embroidered locally</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-green-600">✔</span>
              <span>Crafted with patience, not speed</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-green-600">✔</span>
              <span>Made to feel, not to impress</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
