'use server';

import { convertPrismaObj } from '../utils';
import { LATEST_PRODCUCT_LIMIT } from '../constants';
import { prisma } from '@/db/prisma';

export async function getLatestProducts(limit: number = LATEST_PRODCUCT_LIMIT) {
    try {
        const products = await prisma.product.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        return convertPrismaObj(products);
    } catch (error) {
        console.error('Failed to fetch latest products:', error);
        throw new Error('Failed to fetch latest products');
    }
}

export async function getProductBySlug(slug: string) {
    try {
        const product = await prisma.product.findFirst({
            where: { slug },
        });

        return convertPrismaObj(product);
    } catch (error) {
        console.error('Failed to fetch product by slug:', error);
        throw new Error('Failed to fetch product by slug');
    }
}