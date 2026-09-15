-- Replace subjective/superlative route copy with descriptive wording that is easier to substantiate.
update public.hikes
set
  main_attraction = '500-foot waterfall + gorge scenery',
  description = 'Adventure hike to a 500-foot waterfall gorge in Mauritius.'
where id = 'caf56aca-f237-479b-b7af-817f5fac0de7';

update public.hikes
set
  main_attraction = 'West / south panoramic views',
  description = 'Viewpoint hike with broad western and southern island vistas.'
where id = '1c5253fa-7949-4af1-afd4-186eb7be2d9b';
