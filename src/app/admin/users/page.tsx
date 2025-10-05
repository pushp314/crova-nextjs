
'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/users'); 
        if (res.ok) {
          const data = await res.json();
          setUsers(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

   const LoadingSkeleton = () => (
     <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
      return <LoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>A list of all registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium flex items-center gap-3">
                   <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                 <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'outline'} className="capitalize">
                        {user.role.toLowerCase()}
                    </Badge>
                </TableCell>
                <TableCell>{format(new Date(user.createdAt), 'PPP')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {users.length === 0 && !isLoading && (
            <p className="py-8 text-center text-muted-foreground">No users found.</p>
        )}
      </CardContent>
    </Card>
  );
}
