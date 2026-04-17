-- Migration: unify patent_type enum values to 'Product/Process' and 'Design'
-- 1) Add temporary column with desired enum values
ALTER TABLE patent_tracker ADD COLUMN patent_type_new ENUM('Product/Process','Design') DEFAULT 'Product/Process';

-- 2) Migrate existing values: map 'Product' and 'Process' -> 'Product/Process', keep 'Design'
UPDATE patent_tracker SET patent_type_new = 'Product/Process' WHERE patent_type IN ('Product','Process');
UPDATE patent_tracker SET patent_type_new = 'Design' WHERE patent_type = 'Design';

-- 3) Drop foreign keys or constraints if any depend on patent_type (unlikely). Proceed to drop old column
ALTER TABLE patent_tracker DROP COLUMN patent_type;

-- 4) Rename the new column to patent_type
ALTER TABLE patent_tracker CHANGE COLUMN patent_type_new patent_type ENUM('Product/Process','Design') NOT NULL DEFAULT 'Product/Process';

-- 5) Done. Verify with:
-- SHOW COLUMNS FROM patent_tracker LIKE 'patent_type';
-- SELECT DISTINCT patent_type FROM patent_tracker LIMIT 100;
