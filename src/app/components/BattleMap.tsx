'use client'

import React, { FC, useRef, useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import styles from './map.module.css'
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk'
import "@maptiler/sdk/dist/maptiler-sdk.css";
import * as maptilersdk from '@maptiler/sdk';

import { Battle } from '../types'

type BattleMapProps = {
  battles: Battle[]
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

const BattleMap: FC<BattleMapProps> = ({ battles }) => {
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
        //style: maptilersdk.MapStyle.WINTER,
        style: 'https://api.maptiler.com/maps/3248a2f1-6bc3-480f-9bfc-50439c96592f/style.json?key=XQT6n226c8uDhF910NU4',
      }).addTo(map.current)

      battles.forEach((battle) => {
        const marker = L.marker([battle.latitude, battle.longitude]).addTo(map.current!)

        marker.bindPopup(`
                  <strong>${battle.battleNameJp}</strong> (${battle.year})<br />
                  結果: ${battle.outcomeJp}<br />
                  武将: ${battle.commandersJp}<br />
                  死傷者: ${battle.casualties}
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

export default BattleMap
