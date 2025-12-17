// Nicolas Oliveira - RA 838094
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/comerciante/:path*', '/associado/:path*']
}

