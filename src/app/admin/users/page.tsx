
'use client'
import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangeRoleDialog } from '@/components/admin/change-role-dialog';
import { UserCog } from 'lucide-react';

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


export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = (user: UserProfile) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  const handleRoleUpdateSuccess = () => {
    fetchUsers(); // Refresh the users list
  };

  if (isLoading) {
      return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          Role Information
        </h3>
        <div className="grid gap-2 text-sm text-blue-800 dark:text-blue-200 md:grid-cols-3">
          <div>
            <strong>User:</strong> Regular customer with shopping access
          </div>
          <div>
            <strong>Delivery:</strong> Access to delivery dashboard for order fulfillment
          </div>
          <div>
            <strong>Admin:</strong> Full access to admin dashboard and settings
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions. Assign delivery personnel or admin access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ''} alt={user.name || ''} />
                          <AvatarFallback>{user.name?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        {user.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.role === 'ADMIN' 
                            ? 'destructive' 
                            : user.role === 'DELIVERY' 
                            ? 'default' 
                            : 'outline'
                        } 
                        className="capitalize"
                      >
                        {user.role.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChangeRole(user)}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {users.length === 0 && !isLoading && (
            <p className="py-8 text-center text-muted-foreground">No users found.</p>
          )}
        </CardContent>
      </Card>

      <ChangeRoleDialog
        isOpen={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        user={selectedUser}
        onSuccess={handleRoleUpdateSuccess}
      />
    </>
  );
}
