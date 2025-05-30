/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'
import { serializePayloadData } from '@/utils/serialize'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = async ({ params, searchParams }: Args) => {
  // Serialize the config and params to prevent toJSON method issues
  const serializedConfig = serializePayloadData(config)
  const serializedParams = await params
  const serializedSearchParams = await searchParams
  
  return RootPage({ 
    config: serializedConfig, 
    params: Promise.resolve(serializedParams), 
    searchParams: Promise.resolve(serializedSearchParams), 
    importMap 
  })
}

export default Page
