-- Add unique constraint for upsert to work on sales_data
ALTER TABLE public.sales_data 
ADD CONSTRAINT sales_data_seller_marketplace_date_unique 
UNIQUE (seller_id, marketplace, ano, mes, dia);