import { CsvImporter } from '@/components/admin/CsvImporter';

export default function ImportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Import Models</h1>
      <p className="text-muted-foreground mb-6">
        Upload a CSV or Excel file to bulk-import car models. Map your file columns to database
        fields, preview the data, and import.
      </p>
      <CsvImporter />
    </div>
  );
}
