-- Public bucket for product photography, uploaded from the admin dashboard.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Authenticated users can upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

create policy "Authenticated users can delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
