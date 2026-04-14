-- Fix theses.confidence: change from text enum to integer (0-100)
ALTER TABLE theses DROP CONSTRAINT IF EXISTS theses_confidence_check;
ALTER TABLE theses ALTER COLUMN confidence DROP DEFAULT;
ALTER TABLE theses
  ALTER COLUMN confidence TYPE integer USING
    CASE confidence
      WHEN 'forming' THEN 25
      WHEN 'developing' THEN 50
      WHEN 'conviction' THEN 80
      ELSE NULL
    END;
ALTER TABLE theses ALTER COLUMN confidence DROP NOT NULL;
ALTER TABLE theses ADD CONSTRAINT theses_confidence_range
  CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100));

-- Fix companies.status: expand allowed values
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_status_check;
ALTER TABLE companies ADD CONSTRAINT companies_status_check
  CHECK (status IN ('watching', 'tracking', 'active', 'meeting', 'diligence', 'passed', 'invested', 'portfolio'));

-- Add updated_at auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_theses_updated_at ON theses;
CREATE TRIGGER update_theses_updated_at
  BEFORE UPDATE ON theses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
