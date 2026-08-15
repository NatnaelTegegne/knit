interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

export default async function CredentialDetailPage({ params }: PageProps) {
  const { credentialId } = await params;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Credential Details</h1>
        <p className="text-muted-foreground">ID: {credentialId}</p>
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Credential details will be displayed here.
        </p>
      </div>
    </div>
  );
}