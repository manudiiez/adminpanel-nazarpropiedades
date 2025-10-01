// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { es } from '@payloadcms/translations/languages/es' // español
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Clientes } from './collections/Clientes'
import { s3Storage } from '@payloadcms/storage-s3'
import { Propiedades } from './collections/Propiedades'
import { Contratos } from './collections/Contratos'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  i18n: {
    fallbackLanguage: 'es', // default
    supportedLanguages: { es },
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      logout: {
        Button: '@/components/LogoutButton/LogoutButton',
      },
      graphics: {
        Icon: '@/components/brand/IconComponent',
        Logo: '@/components/brand/LogoComponent/LogoComponent',
      },
    },
  },
  collections: [Users, Media, Clientes, Propiedades, Contratos],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
    s3Storage({
      collections: { media: { prefix: process.env.R2_PREFIX || '' } },
      bucket: process.env.R2_BUCKET!,
      // baseURL: process.env.R2_PUBLIC_BASE_URL, // sirve URLs bonitas desde tu CDN
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: 'auto',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: true,
      },
    }),
  ],
})
