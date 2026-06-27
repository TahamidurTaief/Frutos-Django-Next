/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        staleTimes: {
            dynamic: 0,
            static: 30,
        },
        serverActions: {
            allowedOrigins: [
                '10.17.90.71',
                '10.17.90.71:3000',
                'localhost:3000',
                '127.0.0.1:3000',
                'frutos.athome.com.bd'
            ]
        },
    },

    images: {
        unoptimized: true, // Jetuku proyojon, optimized line change kore unoptimized use korte paren debug er jonno
        remotePatterns: [
            // 1. Eiti hocche apnar network IP pattern jeti onno device theke image load korbe
            {
                protocol: 'http',
                hostname: '10.17.90.71',
                port: '8000',
                pathname: '/media/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/media/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/media/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'frutos.athome.com.bd',
                pathname: '/media/**',
            },
        ],
    },
}

export default nextConfig