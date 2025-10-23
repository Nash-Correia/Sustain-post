import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '4px',
          border: '1px solid rgba(20, 184, 166, 0.3)',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0f766e',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          IiAS
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}