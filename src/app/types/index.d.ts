import type { NextPage, NextPageWithLayout } from 'next'

declare module 'next' {
  type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactElement
  }
}

declare module 'next/app' {
  type AppPropsWithLayout<P = object> = AppProps<P> & {
    Component: NextPageWithLayout<P>
    emotionCache?: EmotionCache
  }
}

export type Battle = {
  year: number
  battleName: string
  battleNameJp: string
  description: string
  descriptionJp: string
  outcome: string
  outcomeJp: string
  casualties: string
  commanders: string
  commandersJp: string
  address: string
  latitude: number
  longitude: number
}
