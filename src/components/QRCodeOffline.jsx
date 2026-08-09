import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeOffline({
  value = '',
  size = 140,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  margin = 3,
}) {
  return (
    <QRCodeSVG
      value={value || 'NO_DATA'}
      size={size}
      fgColor={fgColor}
      bgColor={bgColor}
      level="M"
      marginSize={margin}
    />
  );
}
