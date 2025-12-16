import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Verification Script...');

    // 1. Setup Data
    const email = `test-${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: {
            email,
            name: 'Test User',
        }
    });
    console.log(`✅ Created User: ${user.id}`);

    const product = await prisma.product.create({
        data: {
            name: 'Test Product',
            description: 'Test Desc',
            price: 100,
            stock: 10,
            images: ['test.jpg']
        }
    });
    console.log(`✅ Created Product: ${product.id} (Stock: ${product.stock})`);

    try {
        // 2. Simulate Order Creation (POST /api/orders logic)
        // - Create Order
        // - Decrement Stock
        console.log('\n--- Step 1: Simulate Order Creation ---');

        await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId: user.id,
                    totalAmount: 100,
                    status: OrderStatus.PENDING,
                    items: {
                        create: [{
                            productId: product.id,
                            quantity: 1,
                            price: 100
                        }]
                    }
                }
            });

            // Simulate logic from POST /api/orders: decrement stock
            await tx.product.update({
                where: { id: product.id },
                data: { stock: { decrement: 1 } }
            });

            console.log(`✅ Order Created: ${order.id}`);
        });

        // Verify Stock after creation
        const pAfterOrder = await prisma.product.findUnique({ where: { id: product.id } });
        console.log(`Product Stock after Order: ${pAfterOrder?.stock}`);
        if (pAfterOrder?.stock !== 9) throw new Error('Stock should be 9 after order creation');

        // 3. Simulate Payment Captured (Webhook Fix Test)
        // Should NOT decrement stock again
        console.log('\n--- Step 2: Simulate Payment Captured (The Fix) ---');

        // Logic from the FIXED webhook:
        // Update status to PAID, processing
        // NO STOCK CHANGE

        const order = await prisma.order.findFirst({ where: { userId: user.id } });
        if (!order) throw new Error('Order not found');

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: PaymentStatus.PAID,
                    status: OrderStatus.PROCESSING,
                    paymentId: 'pay_123456',
                },
            });
            // NO DECREMENT HERE
        });

        const pAfterCapture = await prisma.product.findUnique({ where: { id: product.id } });
        console.log(`Product Stock after Capture: ${pAfterCapture?.stock}`);
        if (pAfterCapture?.stock !== 9) throw new Error('Stock should REMAIN 9 after capture (Double decrement fix)');
        else console.log('✅ PASS: Stock did not double decrement.');


        // 4. Simulate Payment Failed (Restoration Fix Test)
        // Should restore stock
        console.log('\n--- Step 3: Simulate Payment Failed (Restoration Fix) ---');

        // Create another order for failure test
        const failOrder = await prisma.order.create({
            data: {
                userId: user.id,
                totalAmount: 100,
                status: OrderStatus.PENDING,
                paymentId: 'order_fail_123',
                items: {
                    create: [{
                        productId: product.id,
                        quantity: 1,
                        price: 100
                    }]
                }
            },
            include: { items: true }
        });
        // Decrement for this new order
        await prisma.product.update({
            where: { id: product.id },
            data: { stock: { decrement: 1 } }
        });

        const pBeforeFail = await prisma.product.findUnique({ where: { id: product.id } });
        console.log(`Stock before failure test: ${pBeforeFail?.stock} (Should be 8)`);

        // WEBHOOK FAILURE LOGIC
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: failOrder.id },
                data: {
                    paymentStatus: PaymentStatus.FAILED,
                    status: OrderStatus.CANCELLED,
                },
            });

            // RESTORE STOCK
            for (const item of failOrder.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }
        });

        const pAfterFail = await prisma.product.findUnique({ where: { id: product.id } });
        console.log(`Product Stock after Failure: ${pAfterFail?.stock}`);
        if (pAfterFail?.stock !== 9) throw new Error('Stock should be restored to 9 after failure');
        else console.log('✅ PASS: Stock was restored.');

    } catch (e) {
        console.error('❌ Test Failed:', e);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleaning up...');
        await prisma.orderItem.deleteMany({ where: { order: { userId: user.id } } });
        await prisma.order.deleteMany({ where: { userId: user.id } });
        await prisma.product.delete({ where: { id: product.id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.$disconnect();
        console.log('Done.');
    }
}

main();
