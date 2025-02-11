'use server';

import { PrismaClient, Product } from '@prisma/client';
import { convertPrismaObj } from '../utils';
import { LATEST_PRODCUCT_LIMIT } from '../constants';

export async function getLatestProducts(limit: number = LATEST_PRODCUCT_LIMIT): Promise<Product[]> {
    try {
        const prisma = new PrismaClient();
        const products = await prisma.product.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        return convertPrismaObj<Product[]>(products);
    } catch (error) {
        console.error('Failed to fetch latest products:', error);
        throw new Error('Failed to fetch latest products');
    }
}