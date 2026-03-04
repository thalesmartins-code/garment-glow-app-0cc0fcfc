CREATE UNIQUE INDEX IF NOT EXISTS sales_data_unique_record 
ON public.sales_data (seller_id, marketplace, ano, mes, dia);