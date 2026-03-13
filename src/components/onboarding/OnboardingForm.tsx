import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { CvDropzone } from '@/components/ui/cv-dropzone';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EDUCATION_LEVELS } from '@/lib/validation';

type UploadFileData = {
  fileName: string;
  mimeType: string;
  data: string;
};

export default function OnboardingForm({
  fullName,
  setFullName,
  iin,
  setIin,
  phone,
  setPhone,
  city,
  setCity,
  placeOfStudy,
  setPlaceOfStudy,
  parentPhone,
  setParentPhone,
  educationLevel,
  setEducationLevel,
  setCvUrl,
  loading,
  cvUploading,
  setCvUploading,
  error,
  onSubmit,
  onSignOut,
  uploadFile,
  deleteFile,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  iin: string;
  setIin: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  placeOfStudy: string;
  setPlaceOfStudy: (v: string) => void;
  parentPhone: string;
  setParentPhone: (v: string) => void;
  educationLevel: string;
  setEducationLevel: (v: string) => void;
  setCvUrl: (v: string | null) => void;
  loading: boolean;
  cvUploading: boolean;
  setCvUploading: (v: boolean) => void;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onSignOut: () => void | Promise<void>;
  uploadFile: (data: UploadFileData) => Promise<{ url: string; fileId: string }>;
  deleteFile: (fileId: string) => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <>
      <CardTitle className="mb-1 text-xl text-hacknu-text">
        {t('onboarding.completeProfile')}
      </CardTitle>
      <CardDescription className="mb-6 text-hacknu-text-muted">
        {t('onboarding.completeProfileDesc')}
      </CardDescription>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field>
          <FieldLabel
            htmlFor="fullName"
            className="tracking-wider text-hacknu-text-muted uppercase"
          >
            {t('onboarding.fullName')}
          </FieldLabel>
          <Input
            id="fullName"
            type="text"
            placeholder={t('onboarding.fullNamePlaceholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
            className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="iin" className="tracking-wider text-hacknu-text-muted uppercase">
            {t('onboarding.iin')}
          </FieldLabel>
          <Input
            id="iin"
            type="text"
            inputMode="numeric"
            placeholder={t('onboarding.iinPlaceholder')}
            maxLength={12}
            value={iin}
            onChange={(e) => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
            required
            disabled={loading}
            className="border-hacknu-border bg-hacknu-dark font-mono tracking-widest text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone" className="tracking-wider text-hacknu-text-muted uppercase">
            {t('onboarding.phone')}
          </FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder={t('onboarding.phonePlaceholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={loading}
            className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="city" className="tracking-wider text-hacknu-text-muted uppercase">
            {t('onboarding.city')}
          </FieldLabel>
          <Input
            id="city"
            type="text"
            placeholder={t('onboarding.cityPlaceholder')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={loading}
            className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
          />
        </Field>

        <Field>
          <FieldLabel
            htmlFor="placeOfStudy"
            className="tracking-wider text-hacknu-text-muted uppercase"
          >
            {t('onboarding.placeOfStudy')}
          </FieldLabel>
          <Input
            id="placeOfStudy"
            type="text"
            placeholder={t('onboarding.placeOfStudyPlaceholder')}
            value={placeOfStudy}
            onChange={(e) => setPlaceOfStudy(e.target.value)}
            required
            disabled={loading}
            className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
          />
        </Field>

        <Field>
          <FieldLabel
            htmlFor="parentPhone"
            className="tracking-wider text-hacknu-text-muted uppercase"
          >
            {t('onboarding.parentPhone')}
          </FieldLabel>
          <FieldDescription className="text-hacknu-text-muted/60">
            {t('onboarding.parentPhoneOptional')}
          </FieldDescription>
          <Input
            id="parentPhone"
            type="tel"
            placeholder={t('onboarding.parentPhonePlaceholder')}
            value={parentPhone}
            onChange={(e) => setParentPhone(e.target.value)}
            disabled={loading}
            className="border-hacknu-border bg-hacknu-dark text-hacknu-text placeholder:text-hacknu-text-muted/50 focus-visible:border-hacknu-green"
          />
        </Field>

        <Field>
          <FieldLabel
            htmlFor="educationLevel"
            className="tracking-wider text-hacknu-text-muted uppercase"
          >
            {t('onboarding.educationLevel')}
          </FieldLabel>
          <Select
            value={educationLevel}
            onValueChange={(val) => setEducationLevel(val ?? '')}
            disabled={loading}
          >
            <SelectTrigger className="w-full border-hacknu-border bg-hacknu-dark text-hacknu-text focus-visible:border-hacknu-green">
              <SelectValue placeholder={t('onboarding.educationPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="border-hacknu-border bg-hacknu-dark-card">
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem
                  key={level}
                  value={level}
                  className="text-hacknu-text focus:bg-hacknu-green/10 focus:text-hacknu-green"
                >
                  {t(`education.${level}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel className="tracking-wider text-hacknu-text-muted uppercase">
            {t('onboarding.cvResume')}
          </FieldLabel>
          <FieldDescription className="text-hacknu-text-muted/60">
            {t('onboarding.cvOptional')}
          </FieldDescription>
          <CvDropzone
            onUpload={(url) => setCvUrl(url)}
            onClear={() => setCvUrl(null)}
            uploadFile={uploadFile}
            deleteFile={deleteFile}
            onUploadingChange={setCvUploading}
            disabled={loading}
          />
        </Field>

        {error && (
          <FieldError className="border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400">
            <span className="mr-2 font-mono text-red-500">{t('onboarding.errorPrefix')}</span>
            {error}
          </FieldError>
        )}

        <Button
          type="submit"
          disabled={loading || cvUploading}
          className="mt-2 h-10 w-full bg-hacknu-green font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80 hover:shadow-[0_0_20px_rgba(88,225,145,0.3)]"
        >
          {loading ? t('onboarding.saving') : t('onboarding.submit')}
        </Button>
      </form>

      <Separator className="my-4 bg-hacknu-border" />

      <div className="mt-3 text-center">
        <ConfirmButton
          label={t('onboarding.signOutDifferent')}
          confirmLabel={t('dashboard.confirmAction')}
          onConfirm={onSignOut}
          variant="link"
          size="xs"
          className="text-hacknu-text-muted/60 hover:text-red-400"
        />
      </div>
    </>
  );
}
