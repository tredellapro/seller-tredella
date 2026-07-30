/** @type {import('next-sitemap').IConfig} */
const excludePages = [
  '/dashboard*',
  '/login',
  '/signup',
  '/forgot-password',
  '/thank-you'
];

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://seller.tredella.com',
  generateRobotsTxt: true,
  exclude: excludePages,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: excludePages.map((page) => page.replace('*', ''))
      }
    ]
  }
};
