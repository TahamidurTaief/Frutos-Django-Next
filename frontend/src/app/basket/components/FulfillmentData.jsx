// Server Component — no 'use client'
import { getDeliveryOption, getNearestStore } from '@/lib/api'
import FulfillmentSwitcher from '@/app/basket/components/FulfillmentSwitcher'

export default async function FulfillmentData({ fulfillment, setFulfillment }) {
  const [deliveryData, storeData] = await Promise.allSettled([
    getDeliveryOption(),
    getNearestStore(),   // server-side, no geolocation — backend returns first store
  ])

  return (
    <FulfillmentSwitcher
      fulfillment={fulfillment}
      setFulfillment={setFulfillment}
      initialDelivery={deliveryData.status === 'fulfilled' ? deliveryData.value : null}
      initialStore={storeData.status === 'fulfilled' ? storeData.value : null}
    />
  )
}