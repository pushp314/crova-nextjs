"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCart } from '@/contexts/cart-context';
import { Card } from '../ui/card';

type ProductDetailClientProps = {
  product: Product;
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
  };
  
  return (
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        <Carousel className="w-full">
            <CarouselContent>
                {product.images.map((image, index) => (
                <CarouselItem key={index}>
                    <Card className="overflow-hidden border-none shadow-none rounded-none">
                        <div className="relative aspect-[3/4]">
                            <Image
                                src={image}
                                alt={`${product.name} - view ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </Card>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
        </Carousel>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
          <p className="text-2xl font-semibold">${product.price.toFixed(2)}</p>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Color: {selectedColor}</h2>
            <RadioGroup
              value={selectedColor}
              onValueChange={setSelectedColor}
              className="flex flex-wrap gap-2"
            >
              {product.colors.map((color) => (
                <Label key={color} htmlFor={`color-${color}`} className="cursor-pointer">
                  <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
                  <div
                    className="rounded-full w-8 h-8 border-2"
                    style={{ backgroundColor: color.toLowerCase(), borderColor: selectedColor === color ? 'hsl(var(--ring))' : 'transparent' }}
                  ></div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Size: {selectedSize}</h2>
            <RadioGroup
              value={selectedSize}
              onValueChange={setSelectedSize}
              className="flex flex-wrap gap-2"
            >
              {product.sizes.map((size) => (
                <Label
                  key={size}
                  htmlFor={`size-${size}`}
                  className={`flex h-10 w-16 cursor-pointer items-center justify-center rounded-md border text-sm font-medium transition-colors
                  ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                >
                  <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                  {size}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center gap-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Heart className="h-6 w-6" />
              <span className="sr-only">Add to Wishlist</span>
            </Button>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Product Description</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                {product.description}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}