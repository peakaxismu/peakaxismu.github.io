-- Production cleanup migration. Testimonials are intentionally left empty until
-- genuine customer feedback is available.

delete from public.testimonials
where lower(name) in ('john doe', 'jane doe', 'test user', 'sample customer', 'happy hiker');
