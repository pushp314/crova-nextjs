
'use client';

import { useState, useEffect } from 'react';
import type { Address } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Home } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddressFormDialog } from './address-form-dialog';
import { cn } from '@/lib/utils';

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        setAddresses(await res.json());
      } else {
        toast.error('Failed to load addresses.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching addresses.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete address');
      }
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success('Address deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete address', { description: error.message });
    }
  };

  const onAddressSaved = (savedAddress: Address) => {
    if (editingAddress) {
      setAddresses(addresses.map(addr => (addr.id === savedAddress.id ? savedAddress : addr)));
    } else {
      setAddresses([...addresses, savedAddress]);
    }
    // If a new default is set, update other addresses
    if (savedAddress.isDefault) {
        setAddresses(prev => prev.map(addr => addr.id === savedAddress.id ? savedAddress : {...addr, isDefault: false}));
    }
    setIsDialogOpen(false);
  };
  
  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error('Failed to set default address');

      const updatedAddress = await res.json();
      setAddresses(prev => prev.map(addr => addr.id === updatedAddress.id ? updatedAddress : {...addr, isDefault: false}));
      toast.success('Default address updated.');
    } catch (error: any) {
      toast.error('Operation failed', { description: error.message });
    }
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Shipping Addresses</CardTitle>
            <CardDescription>Manage your saved shipping locations.</CardDescription>
          </div>
          <Button onClick={handleAddAddress}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map(address => (
                <div key={address.id} className={cn("rounded-lg border p-4 flex justify-between items-start", address.isDefault && "border-primary")}>
                  <div>
                    {address.isDefault && <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><Home className="h-3 w-3" /> DEFAULT</div>}
                    <p className="font-medium">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                       <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>Set as Default</Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEditAddress(address)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this address. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAddress(address.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">You haven't saved any addresses yet.</p>
          )}
        </CardContent>
      </Card>
      <AddressFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        address={editingAddress}
        onSave={onAddressSaved}
      />
    </>
  );
}
