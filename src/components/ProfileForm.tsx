import type { Sex, UserProfile } from '../lib/types';

interface ProfileFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

const sexOptions: Array<{ value: Sex; label: string }> = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타 / 선택 안 함' },
];

export default function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const updateProfile = (partialProfile: Partial<UserProfile>) => {
    onChange({
      ...profile,
      ...partialProfile,
    });
  };

  return (
    <section aria-labelledby="profile-form-title" className="space-y-6">
      <div>
        <h2 id="profile-form-title" className="section-label">
          성별
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {sexOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateProfile({ sex: option.value })}
              className={`rounded-xl px-4 py-3 text-xs font-bold transition ${
                profile.sex === option.value
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-surface text-brand-muted hover:bg-orange-50 hover:text-brand-orange'
              } ${option.value === 'other' ? 'col-span-2' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="age" className="section-label">
          나이
        </label>
        <input
          id="age"
          type="number"
          min={0}
          max={120}
          value={profile.age}
          onChange={(event) => {
            const value = event.target.value;
            updateProfile({ age: value === '' ? '' : Number(value) });
          }}
          className="field-input mt-3"
          placeholder="나이를 입력해주세요."
        />
      </div>

      <div>
        <h2 className="section-label">임산부</h2>
        <button
          type="button"
          onClick={() => updateProfile({ pregnant: !profile.pregnant })}
          className={`mt-3 w-[165px] rounded-xl px-4 py-4 text-sm font-extrabold transition ${
            profile.pregnant
              ? 'bg-brand-orange text-white'
              : 'bg-brand-surface text-brand-muted hover:bg-orange-50 hover:text-brand-orange'
          }`}
          aria-pressed={profile.pregnant}
        >
          {profile.pregnant ? '임산부입니다.' : '해당 없음'}
        </button>
        <p className="mt-3 text-sm leading-6 text-brand-muted">
          개인 특성에 따라 금기·주의 여부가 달라질 수 있습니다.
        </p>
      </div>
    </section>
  );
}
