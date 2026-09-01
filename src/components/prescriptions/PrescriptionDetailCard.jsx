import { formatDate, formatNumber } from '../../utils/formatters'

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}

/** Prescription clinical details — medicine, dosing instructions, and issuance dates. */
export default function PrescriptionDetailCard({ prescription }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Medicine">{prescription.medicineName}</Field>
      <Field label="Strength / Form">
        {prescription.strength} · {prescription.dosageForm}
      </Field>
      <Field label="Dosage">{prescription.dosage}</Field>
      <Field label="Frequency">{prescription.frequency}</Field>
      <Field label="Duration">{prescription.duration}</Field>
      <Field label="Quantity">{formatNumber(prescription.quantity)}</Field>
      <Field label="Doctor">{prescription.doctorName}</Field>
      <Field label="Issue Date">{formatDate(prescription.issuedDate)}</Field>
      <Field label="Expiry Date">{formatDate(prescription.expiryDate)}</Field>
      {prescription.dispensedDate && <Field label="Dispensed Date">{formatDate(prescription.dispensedDate)}</Field>}
    </dl>
  )
}
