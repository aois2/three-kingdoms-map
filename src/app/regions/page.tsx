'use client'

import { NextPage } from 'next'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import styles from '../page.module.css'

import { Battle } from '../types'

const RegionsMap = dynamic(() => import('../components/RegionsMap'), {
  ssr: false,
})

const Battles = () => {
  // const [battles, setBattles] = useState([])

  // useEffect(() => {
  //   const fetchBattlesData = async () => {
  //     const response = await fetch('/battles.json')
  //     const data = await response.json()
  //     setBattles(data)
  //   }

  //   fetchBattlesData()
  // }, [])

  return (
    <main className={styles.main}>
      <RegionsMap />
    </main>
  )
}

export default Battles