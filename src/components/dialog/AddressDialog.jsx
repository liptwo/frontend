'use client'

import { useState, useEffect } from 'react'
import { fetchProvinces, fetchProvinceDetail } from '@/Data/VNProvinces'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { MapPin, Home, Building2, Map } from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'

export function AddressDialog({ isOpen, onClose, onSave, initialAddress }) {
  // State for selected values
  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [wardCode, setWardCode] = useState('')
  const [specificAddress, setSpecificAddress] = useState('')

  // State for lists from API
  const [provincesList, setProvincesList] = useState([])
  const [districtsList, setDistrictsList] = useState([])
  const [wardsList, setWardsList] = useState([])

  useEffect(() => {
    if (initialAddress) {
      setProvinceCode(initialAddress.provinceCode || '')
      setDistrictCode(initialAddress.districtCode || '')
      setWardCode(initialAddress.wardCode || '')
      setSpecificAddress(initialAddress.specificAddress || '')
    }
  }, [initialAddress, isOpen])

  // Fetch provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      const data = await fetchProvinces()
      setProvincesList(data || [])
    }
    loadProvinces()
  }, [])

  // Fetch districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (provinceCode) {
        const provinceDetail = await fetchProvinceDetail(provinceCode)
        setDistrictsList(provinceDetail?.districts || [])
      } else {
        setDistrictsList([])
      }
      setDistrictCode('')
      setWardsList([])
      setWardCode('')
    }
    loadDistricts()
  }, [provinceCode])

  // Fetch wards when district changes
  useEffect(() => {
    const loadWards = async () => {
      if (districtCode) {
        const selectedDistrict = districtsList.find(
          (d) => d.code == districtCode
        )
        setWardsList(selectedDistrict?.wards || [])
      } else {
        setWardsList([])
      }
      setWardCode('')
    }
    loadWards()
  }, [districtCode, districtsList])

  const handleSave = () => {
    if (
      !provinceCode ||
      !districtCode ||
      !wardCode ||
      !specificAddress.trim()
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ')
      return
    }

    const province = provincesList.find((p) => p.code == provinceCode)
    const district = districtsList.find((d) => d.code == districtCode)
    const ward = wardsList.find((w) => w.code == wardCode)

    onSave({
      province: provinceCode,
      provinceLabel: province?.name || '',
      district: districtCode,
      districtLabel: district?.name || '',
      ward: wardCode,
      wardLabel: ward?.name || '',
      specificAddress
    })

    toast.success('Đã cập nhật địa chỉ thành công')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
              <MapPin className='w-5 h-5 text-white' />
            </div>
            <div>
              <DialogTitle className='text-2xl'>Chọn địa chỉ</DialogTitle>
              <DialogDescription>
                Vui lòng điền đầy đủ thông tin địa chỉ của bạn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-5 py-4'>
          {/* Province Select */}
          <div className='space-y-2'>
            <Label
              htmlFor='province'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <Map className='w-4 h-4 text-blue-600' />
              Tỉnh, Thành phố
              <span className='text-red-500'>*</span>
            </Label>
            <Select value={provinceCode} onValueChange={setProvinceCode}>
              <SelectTrigger id='province' className='h-11'>
                <SelectValue placeholder='Chọn tỉnh, thành phố' />
              </SelectTrigger>
              <SelectContent>
                {provincesList.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Select */}
          <div className='space-y-2'>
            <Label
              htmlFor='district'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <Building2 className='w-4 h-4 text-purple-600' />
              Quận, Huyện, Thị xã
              <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={districtCode}
              onValueChange={setDistrictCode}
              disabled={!provinceCode}
            >
              <SelectTrigger
                id='district'
                className='h-11'
                disabled={!provinceCode}
              >
                <SelectValue
                  placeholder={
                    provinceCode ? 'Chọn quận, huyện' : 'Chọn tỉnh trước'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {districtsList.map((d) => (
                  <SelectItem key={d.code} value={d.code}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ward Select */}
          <div className='space-y-2'>
            <Label
              htmlFor='ward'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <MapPin className='w-4 h-4 text-green-600' />
              Phường, Xã, Thị trấn
              <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={wardCode}
              onValueChange={setWardCode}
              disabled={!districtCode}
            >
              <SelectTrigger
                id='ward'
                className='h-11'
                disabled={!districtCode}
              >
                <SelectValue
                  placeholder={
                    districtCode ? 'Chọn phường, xã' : 'Chọn quận/huyện trước'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {wardsList.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specific Address */}
          <div className='space-y-2'>
            <Label
              htmlFor='address'
              className='flex items-center gap-2 text-sm font-semibold'
            >
              <Home className='w-4 h-4 text-orange-600' />
              Địa chỉ cụ thể
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='address'
              type='text'
              placeholder='Ví dụ: Số 123, đường ABC...'
              className='h-11'
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
            />
          </div>

          {/* Info Box */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <p className='text-sm text-blue-800'>
              <span className='font-semibold'>Lưu ý:</span> Vui lòng điền đầy đủ
              và chính xác thông tin địa chỉ để việc giao dịch được thuận lợi
              hơn.
            </p>
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            className='flex-1 sm:flex-none bg-transparent'
          >
            Hủy
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            className='flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddressDialog
