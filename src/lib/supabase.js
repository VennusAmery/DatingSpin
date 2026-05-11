// src/lib/supabase.js
// ============================================================
// Cliente de Supabase + helpers para toda la app
// ============================================================
// Setup:
// 1. npm install @supabase/supabase-js
// 2. Crea .env en la raíz del proyecto:
//    REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//    REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
// ============================================================

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ── AUTH ─────────────────────────────────────────────────────

export const auth = {
  signUp: (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getUser: () => supabase.auth.getUser(),

  onAuthChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

// ── PROFILES ─────────────────────────────────────────────────

export const profiles = {
  get: (userId) =>
    supabase.from('profiles').select('*').eq('id', userId).single(),

  update: (userId, data) =>
    supabase.from('profiles').update(data).eq('id', userId),

  linkPartner: async (userId, partnerUsername) => {
    const { data: partner } = await supabase
      .from('profiles').select('id').eq('username', partnerUsername).single();
    if (!partner) throw new Error('Usuario no encontrado');
    await supabase.from('profiles').update({ partner_id: partner.id }).eq('id', userId);
    await supabase.from('profiles').update({ partner_id: userId }).eq('id', partner.id);
    return partner;
  },

  uploadAvatar: async (userId, file) => {
    const ext  = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
    return data.publicUrl;
  },
};

// ── DIARY ─────────────────────────────────────────────────────

export const diary = {
  getAll: (userId) =>
    supabase.from('diary_entries')
      .select('*, diary_photos(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false }),

  get: (entryId) =>
    supabase.from('diary_entries')
      .select('*, diary_photos(*)')
      .eq('id', entryId)
      .single(),

  create: async (userId, entry, photos = []) => {
    const { data, error } = await supabase.from('diary_entries').insert({
      user_id:     userId,
      title:       entry.title,
      activity_id: entry.activityId,
      date:        entry.date,
      rating:      entry.rating,
      feeling:     entry.feeling,
      mood:        entry.mood,
      weather:     entry.weather,
      location:    entry.location,
      with_who:    entry.withWho,
      cost:        entry.cost,
      review:      entry.review,
      changes:     entry.changes,
      is_shared:   entry.isShared || false,
    }).select().single();

    if (error) throw error;

    // Subir fotos
    if (photos.length > 0) {
      await diary.uploadPhotos(userId, data.id, photos);
    }
    return data;
  },

  update: async (entryId, entry, photos = null) => {
    const { data, error } = await supabase.from('diary_entries').update({
      title:       entry.title,
      activity_id: entry.activityId,
      date:        entry.date,
      rating:      entry.rating,
      feeling:     entry.feeling,
      mood:        entry.mood,
      weather:     entry.weather,
      location:    entry.location,
      with_who:    entry.withWho,
      cost:        entry.cost,
      review:      entry.review,
      changes:     entry.changes,
      is_shared:   entry.isShared || false,
      updated_at:  new Date().toISOString(),
    }).eq('id', entryId).select().single();

    if (error) throw error;
    return data;
  },

  delete: (entryId) =>
    supabase.from('diary_entries').delete().eq('id', entryId),

  uploadPhotos: async (userId, entryId, base64Photos) => {
    const rows = [];
    for (let i = 0; i < base64Photos.length; i++) {
      const photo = base64Photos[i];
      if (!photo.startsWith('data:')) continue; // ya es URL, saltar

      const blob = await fetch(photo).then(r => r.blob());
      const path = `${userId}/${entryId}/${Date.now()}_${i}.jpg`;
      await supabase.storage.from('diary-photos').upload(path, blob);
      const { data } = supabase.storage.from('diary-photos').getPublicUrl(path);
      rows.push({ entry_id: entryId, storage_path: path, url: data.publicUrl, order_idx: i });
    }
    if (rows.length > 0) {
      await supabase.from('diary_photos').insert(rows);
    }
    return rows;
  },
};

// ── RULETA ────────────────────────────────────────────────────

export const roulette = {
  getCustomIdeas: (userId) =>
    supabase.from('custom_ideas').select('*').eq('user_id', userId).order('created_at'),

  addIdea: (userId, idea) =>
    supabase.from('custom_ideas').insert({ user_id: userId, ...idea }).select().single(),

  updateIdea: (ideaId, data) =>
    supabase.from('custom_ideas').update(data).eq('id', ideaId),

  deleteIdea: (ideaId) =>
    supabase.from('custom_ideas').delete().eq('id', ideaId),

  getDisabled: (userId) =>
    supabase.from('disabled_activities').select('activity_id').eq('user_id', userId),

  toggleDisabled: async (userId, activityId, isDisabled) => {
    if (isDisabled) {
      return supabase.from('disabled_activities').insert({ user_id: userId, activity_id: activityId });
    } else {
      return supabase.from('disabled_activities').delete().eq('user_id', userId).eq('activity_id', activityId);
    }
  },
};

// ── RECETAS ───────────────────────────────────────────────────

export const recipesDB = {
  getAll: (userId) =>
    supabase.from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .eq('user_id', userId)
      .order('created_at'),

  create: async (userId, recipe) => {
    const { data, error } = await supabase.from('recipes').insert({
      user_id:  userId,
      name:     recipe.name,
      emoji:    recipe.emoji,
      servings: recipe.servings,
      notes:    recipe.notes,
    }).select().single();
    if (error) throw error;

    if (recipe.ingredients?.length) {
      await supabase.from('recipe_ingredients').insert(
        recipe.ingredients.map((ing, i) => ({ recipe_id: data.id, name: ing.name, qty: ing.qty, order_idx: i }))
      );
    }
    if (recipe.steps?.length) {
      await supabase.from('recipe_steps').insert(
        recipe.steps.map((step, i) => ({ recipe_id: data.id, instruction: step, order_idx: i }))
      );
    }
    return data;
  },

  update: async (recipeId, recipe) => {
    await supabase.from('recipes').update({
      name: recipe.name, emoji: recipe.emoji, servings: recipe.servings, notes: recipe.notes,
      updated_at: new Date().toISOString(),
    }).eq('id', recipeId);

    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
    await supabase.from('recipe_steps').delete().eq('recipe_id', recipeId);

    if (recipe.ingredients?.length) {
      await supabase.from('recipe_ingredients').insert(
        recipe.ingredients.map((ing, i) => ({ recipe_id: recipeId, name: ing.name, qty: ing.qty, order_idx: i }))
      );
    }
    if (recipe.steps?.length) {
      await supabase.from('recipe_steps').insert(
        recipe.steps.map((step, i) => ({ recipe_id: recipeId, instruction: step, order_idx: i }))
      );
    }
  },

  delete: (recipeId) =>
    supabase.from('recipes').delete().eq('id', recipeId),
};

// ── ROMPEHIELOS ───────────────────────────────────────────────

export const questionsDB = {
  getCustom: (userId, category = null) => {
    let q = supabase.from('custom_questions').select('*').eq('user_id', userId);
    if (category) q = q.eq('category', category);
    return q.order('created_at');
  },

  add: (userId, category, question) =>
    supabase.from('custom_questions').insert({ user_id: userId, category, question }).select().single(),

  delete: (questionId) =>
    supabase.from('custom_questions').delete().eq('id', questionId),

  markUsed: (userId, questionId) =>
    supabase.from('used_questions').upsert({ user_id: userId, question_id: questionId }),

  getUsed: (userId) =>
    supabase.from('used_questions').select('question_id').eq('user_id', userId),
};

// ── PLANIFICADOR ──────────────────────────────────────────────

export const plannerDB = {
  getAll: (userId) =>
    supabase.from('planned_dates').select('*').eq('user_id', userId).order('date', { ascending: true }),

  create: (userId, plan) =>
    supabase.from('planned_dates').insert({ user_id: userId, ...plan }).select().single(),

  update: (planId, data) =>
    supabase.from('planned_dates').update({ ...data, updated_at: new Date().toISOString() }).eq('id', planId),

  delete: (planId) =>
    supabase.from('planned_dates').delete().eq('id', planId),

  markDone: (planId) =>
    supabase.from('planned_dates').update({ status: 'done' }).eq('id', planId),
};

// ── MENSAJES ──────────────────────────────────────────────────

export const messagesDB = {
  getConversation: (userId, partnerId) =>
    supabase.from('messages').select('*')
      .or(`and(from_user_id.eq.${userId},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${userId})`)
      .order('created_at', { ascending: true }),

  send: (fromId, toId, content, type = 'text', mediaUrl = null) =>
    supabase.from('messages').insert({
      from_user_id: fromId,
      to_user_id:   toId,
      content,
      type,
      media_url:    mediaUrl,
    }).select().single(),

  markRead: (toUserId, fromUserId) =>
    supabase.from('messages')
      .update({ is_read: true })
      .eq('to_user_id', toUserId)
      .eq('from_user_id', fromUserId)
      .eq('is_read', false),

  // Escucha mensajes nuevos en tiempo real
  subscribe: (userId, partnerId, onMessage) => {
    return supabase
      .channel('messages')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `to_user_id=eq.${userId}`,
      }, payload => onMessage(payload.new))
      .subscribe();
  },

  unsubscribe: (channel) => supabase.removeChannel(channel),

  uploadMedia: async (userId, file) => {
    const ext  = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    await supabase.storage.from('message-media').upload(path, file);
    const { data } = supabase.storage.from('message-media').getPublicUrl(path);
    return data.publicUrl;
  },
};

// ── GEOCACHE (reemplaza geocache.json del servidor) ───────────

export const geocacheDB = {
  get: (address) =>
    supabase.from('geocache').select('latitude,longitude').eq('address', address).single(),

  set: (address, latitude, longitude) =>
    supabase.from('geocache').upsert({ address, latitude, longitude }),

  getAll: () =>
    supabase.from('geocache').select('*'),
};

// ── EVENTOS FAVORITOS ─────────────────────────────────────────

export const favoritesDB = {
  getAll: (userId) =>
    supabase.from('favorite_events').select('*').eq('user_id', userId),

  add: (userId, event) =>
    supabase.from('favorite_events').upsert({
      user_id:  userId,
      event_id: event.id,
      source:   event.source,
      title:    event.title,
      date:     event.date,
      location: event.location,
      url:      event.url,
    }),

  remove: (userId, eventId) =>
    supabase.from('favorite_events').delete().eq('user_id', userId).eq('event_id', eventId),
};
