

import HeroSection        from '@/app/components/HeroSection'
import ProductGrid        from '@/app/components/ProductGrid'
import LeftoverPackBanner from '@/app/components/LeftoverPackBanner'
import WeekendBox         from '@/app/components/WeekendBox'
import HowItWorks         from '@/app/components/HowItWorks'

import { getProducts, getCategories } from '@/lib/api_product'
import { getHomepageData }            from '@/lib/api_homepage'
import { normalizeFeatureCards, normalizeSteps } from '@/app/config/homepageIcons'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch all data in parallel
  const [products, categories, homepageData] = await Promise.all([
    getProducts(),
    getCategories(),
    getHomepageData(),
  ])

  const { hero, feature_cards, how_it_works, steps, leftover_banner } = homepageData

  // Attach JSX icons (must happen in a .jsx file)
  const featureCards = normalizeFeatureCards(feature_cards)
  const normalizedSteps = normalizeSteps(steps)

  return (
    <>
      <HeroSection
        hero={hero}
        featureCards={featureCards}
      />

      <div className='bg-[var(--section-color)]'>
        <ProductGrid
          initialProducts={products}
          categories={categories}
        />
        <WeekendBox />
        <LeftoverPackBanner banner={leftover_banner} />
      </div>

      <div style={{ backgroundColor: '#ECF7E4' }}>
        <HowItWorks
          heading={how_it_works.heading}
          steps={normalizedSteps}
        />
      </div>
    </>
  )
}