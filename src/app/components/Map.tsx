'use client'

import React, { FC, useRef, useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import styles from './map.module.css'
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk'

import { Battle } from '../types'

type MapProps = {
  battles: Battle[]
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

const Map: FC<MapProps> = ({ battles }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<L.Map | null>(null)
  const center = { lng: 113, lat: 34 }
  const [zoom] = useState<number>(5)

  useEffect(() => {
    if (map.current) return

    if (mapContainer.current) {
      map.current = new L.Map(mapContainer.current, {
        center: L.latLng(center.lat, center.lng),
        zoom: zoom,
      })

      const mtLayer = new MaptilerLayer({
        apiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '',
      }).addTo(map.current)

      battles.forEach((battle) => {
        const marker = L.marker([battle.latitude, battle.longitude]).addTo(map.current!)

        marker.bindPopup(`
                  <strong>${battle.battleNameJp}</strong> (${battle.year})<br />
                  Outcome: ${battle.outcomeJp}<br />
                  Commanders: ${battle.commandersJp}<br />
                  Casualties: ${battle.casualties}
                `)
      })
    }
  }, [battles, center.lat, center.lng, zoom])

  return (
    <div className={styles.mapWrap}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  )
}

export default Map
