// Componente servidor que obtiene la imagen y delega a cliente
import ImageCellServer from './ImageCellServer'

interface ImageCellProps {
  cellData?: any
  rowData?: any
}

export default function ImageCell({ cellData, rowData }: ImageCellProps) {
  return <ImageCellServer cellData={cellData} rowData={rowData} />
}
