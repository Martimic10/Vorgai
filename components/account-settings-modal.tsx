'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AccountSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenBilling: () => void
  user: any
}

export function AccountSettingsModal({ isOpen, onClose, onOpenBilling, user }: AccountSettingsModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [userPlan, setUserPlan] = useState('free')
  const supabase = createClient()

  // Load user profile data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile()
      loadUserPlan()
    }
  }, [isOpen, user])

  const loadUserProfile = async () => {
    if (!user?.id) return

    const { data } = await supabase
      .from('profiles')
      .select('name, description')
      .eq('id', user.id)
      .single()

    if (data) {
      setName(data.name || '')
      setDescription(data.description || '')
    }
  }

  const loadUserPlan = async () => {
    if (!user?.id) return

    const { data } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setUserPlan(data.plan || 'free')
    }
  }

  const handleSave = async () => {
    if (!user?.id) {
      console.error('No user ID found')
      alert('No user ID found. Please try logging out and back in.')
      return
    }

    setSaving(true)

    try {
      console.log('Saving profile for user:', user.id)
      console.log('Name:', name.trim())
      console.log('Description:', description.trim())

      // Upsert profile data
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          description: description.trim(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
        .select()

      if (error) {
        console.error('Error saving profile:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Failed to save changes: ${error.message}. Please check the console for details.`)
      } else {
        console.log('Profile saved successfully:', data)
        alert('Changes saved successfully!')
        onClose()
      }
    } catch (error) {
      console.error('Unexpected error saving profile:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Account settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
            {/* Description */}
            <p className="text-sm text-gray-400">
              Personalize how others see and interact with you on Vorg.
            </p>

            {/* Avatar Section */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Your avatar</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-semibold">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Your avatar is either fetched from your linked identity provider or automatically generated based on your account.
                </p>
              </div>
            </div>

            {/* Current Plan */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Current Plan</h3>
              <div className="bg-[#252525] border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-white mb-1">
                      {userPlan === 'free' ? 'Free Plan' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan`}
                    </p>
                    <p className="text-sm text-gray-400">
                      {userPlan === 'free'
                        ? 'Upgrade to unlock more features and higher project limits'
                        : 'Manage your subscription and billing'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose()
                      onOpenBilling()
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {userPlan === 'free' ? 'Upgrade' : 'Manage'}
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <p className="text-sm text-gray-400 mb-3">
                Your email address associated with your account.
              </p>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name
              </label>
              <p className="text-sm text-gray-400 mb-3">
                Your full name, as visible to others.
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <p className="text-sm text-gray-400 mb-3">
                A brief description about yourself.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              />
            </div>

            {/* Account ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Account ID
              </label>
              <p className="text-sm text-gray-400 mb-3">
                Your unique account identifier.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={user?.id || 'N/A'}
                  disabled
                  className="flex-1 bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
