import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title = 'Visio — Marketplace Électronique Pan-Africaine',
  description = 'Achetez vos téléphones, tablettes et électronique au meilleur prix. Livraison partout en Afrique.',
  image = '/og-image.png',
  url = '',
  type = 'website',
}) => {
  const fullTitle = title.includes('Visio') ? title : `${title} | Visio`;
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://visio-ten.vercel.app';
  const fullUrl = `${siteUrl}${url}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEOHead;