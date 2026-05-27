export interface QueryTypeConfig {
  value: string;
  label: string;
  params: QueryParamDef[];
}

export interface QueryParamDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const SALARY_BRACKETS = [
  'R0-R10k',
  'R10k-R20k',
  'R20k-R30k',
  'R30k-R50k',
  'R50k-R80k',
  'R80k-R120k',
  'R120k+',
];

export const QUERY_TYPES: QueryTypeConfig[] = [
  {
    value: 'id_verification',
    label: 'ID Verification',
    params: [],
  },
  {
    value: 'employment_check',
    label: 'Employment Check',
    params: [
      { key: 'company_name', label: 'Company Name', type: 'text', placeholder: 'e.g. Discovery Limited' },
    ],
  },
  {
    value: 'employment_period',
    label: 'Employment Period',
    params: [
      { key: 'company_name', label: 'Company Name', type: 'text', placeholder: 'e.g. Discovery Limited' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
    ],
  },
  {
    value: 'salary_bracket',
    label: 'Salary Bracket',
    params: [
      { key: 'company_name', label: 'Company Name', type: 'text', placeholder: 'e.g. Discovery Limited' },
      {
        key: 'expected_bracket',
        label: 'Expected Bracket',
        type: 'select',
        options: SALARY_BRACKETS.map((b) => ({ value: b, label: b })),
      },
    ],
  },
  {
    value: 'qualification_check',
    label: 'Qualification Check',
    params: [
      { key: 'institution', label: 'Institution', type: 'text', placeholder: 'e.g. University of Cape Town' },
      { key: 'qualification_type', label: 'Qualification Type', type: 'text', placeholder: 'e.g. Bachelor' },
    ],
  },
  {
    value: 'criminal_record_check',
    label: 'Criminal Record Check',
    params: [],
  },
  {
    value: 'interpol_check',
    label: 'Interpol Check',
    params: [],
  },
  {
    value: 'credit_check',
    label: 'Credit Check',
    params: [
      {
        key: 'minimum_band',
        label: 'Minimum Credit Band',
        type: 'select',
        options: [
          { value: 'Excellent', label: 'Excellent (750+)' },
          { value: 'Good', label: 'Good (700-749)' },
          { value: 'Fair', label: 'Fair (600-699)' },
          { value: 'Poor', label: 'Poor (below 600)' },
        ],
      },
    ],
  },
  {
    value: 'drivers_licence_check',
    label: "Driver's Licence Check",
    params: [
      { key: 'licence_code', label: 'Licence Code', type: 'text', placeholder: 'e.g. B, C1, EC' },
    ],
  },
  {
    value: 'professional_registration_check',
    label: 'Professional Registration Check',
    params: [
      { key: 'body_name', label: 'Professional Body', type: 'text', placeholder: 'e.g. ECSA, LSSA' },
    ],
  },
  {
    value: 'address_verification',
    label: 'Address Verification',
    params: [
      { key: 'address_type', label: 'Address Type', type: 'select', options: [
        { value: 'residential', label: 'Residential' },
        { value: 'postal', label: 'Postal' },
        { value: 'work', label: 'Work' },
      ]},
    ],
  },
  {
    value: 'reference_check',
    label: 'Reference Check',
    params: [
      { key: 'company_name', label: 'Company Name', type: 'text', placeholder: 'e.g. Standard Bank' },
    ],
  },
];

export function getQueryLabel(queryType: string): string {
  return QUERY_TYPES.find((q) => q.value === queryType)?.label ?? queryType;
}
