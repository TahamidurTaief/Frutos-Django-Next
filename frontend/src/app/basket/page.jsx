// src/app/basket/page.jsx — SERVER COMPONENT
import BasketShell from '@/app/basket/components/BasketShell'
import { getDeliveryOption, getNearestStore } from '@/lib/api'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your Basket | El Árbol',
  description: 'Review your selected products before checkout.',
}

export default async function BasketPage() {
  const [deliveryResult, storeResult] = await Promise.allSettled([
    getDeliveryOption(),
    getNearestStore(),
  ])

  return (
    <BasketShell
      initialDelivery={deliveryResult.status === 'fulfilled' ? deliveryResult.value : null}
      initialStore={storeResult.status === 'fulfilled' ? storeResult.value : null}
    />
  )
}