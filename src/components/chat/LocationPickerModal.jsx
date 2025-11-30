import React, { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup
} from 'react-leaflet'
import { Loader2 } from 'lucide-react'

// Component con để xử lý sự kiện click trên bản đồ
function MapClickHandler({ onMapClick, position }) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    }
  })

  // Tự động di chuyển đến vị trí đã chọn
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom())
    }
  }, [position, map])

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Bạn đã chọn vị trí này</Popup>
    </Marker>
  )
}

const LocationPickerModal = ({ isOpen, onClose, onLocationSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [initialCenter, setInitialCenter] = useState([10.762622, 106.660172]) // Mặc định là TPHCM
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Lấy vị trí hiện tại của người dùng để làm trung tâm bản đồ
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialCenter([
            position.coords.latitude,
            position.coords.longitude
          ])
          setIsLoading(false)
        },
        () => {
          // Nếu không lấy được vị trí, dùng vị trí mặc định
          setIsLoading(false)
        }
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect({
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng
      })
      onClose()
    }
  }

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-lg shadow-xl p-4 w-[90vw] max-w-2xl h-[80vh] flex flex-col gap-4'
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className='text-xl font-semibold text-gray-800'>Chọn một vị trí</h3>
        <div className='flex-1 rounded-lg overflow-hidden relative'>
          {isLoading ? (
            <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
              <Loader2 className='animate-spin' size={32} />
            </div>
          ) : (
            <MapContainer
              center={initialCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
              <MapClickHandler
                onMapClick={setSelectedPosition}
                position={selectedPosition}
              />
            </MapContainer>
          )}
        </div>
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300'
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition}
            className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400'
          >
            Xác nhận vị trí
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationPickerModal
