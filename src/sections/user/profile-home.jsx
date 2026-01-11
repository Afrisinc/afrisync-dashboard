import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

import { ProfilePostItem } from './profile-post-item';

// ----------------------------------------------------------------------

export function ProfileHome({ info, posts: initialPosts }) {
  const [postPrompt, setPostPrompt] = useState('');
  const [openAiDialog, setOpenAiDialog] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsData, setPostsData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [aiFormData, setAiFormData] = useState({
    prompt: '',
    platforms: ['facebook'],
    tone: 'professional',
    includeEmojis: true,
    includeHashtags: true,
    maxLength: 500,
    language: 'en',
    scheduleFor: null,
    includeImage: false,
    imageStyle: 'realistic',
  });

  // Fetch posts on component mount or page change
  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await axiosInstance.get(endpoints.post.list, {
          params: {
            page: pagination.page,
            limit: 10,
          },
        });
        if (response.data?.data?.data) {
          setPostsData(response.data.data.data);
          // Update pagination from response, but preserve the requested page
          setPagination((prev) => ({
            ...response.data.data.pagination,
            page: pagination.page,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPostsData(initialPosts || []);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [pagination.page, initialPosts]);

  const refetchPosts = async () => {
    try {
      const response = await axiosInstance.get(endpoints.post.list, {
        params: {
          page: 1,
          limit: 10,
        },
      });
      if (response.data?.data?.data) {
        setPostsData(response.data.data.data);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to refetch posts:', error);
    }
  };

  const handleGeneratePostFromInput = async () => {
    if (!postPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const payload = {
        ...aiFormData,
        prompt: postPrompt,
      };

      if (payload.scheduleFor) {
        const date = new Date(payload.scheduleFor);
        payload.scheduleFor = date.toISOString();
      }

      const response = await axiosInstance.post(endpoints.ai.generate, payload);
      setAiResult(response.data);
      setPostPrompt('');
      setAiError(null);

      // Refetch posts after successful generation
      await refetchPosts();
    } catch (error) {
      setAiError(error.message || 'Failed to generate post. Please try again.');
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenAiDialog = () => {
    setOpenAiDialog(true);
    setAiError(null);
    setAiResult(null);
  };

  const handleCloseAiDialog = () => {
    setOpenAiDialog(false);
  };

  const handleAiFormChange = (field, value) => {
    setAiFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGeneratePost = async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const payload = { ...aiFormData };

      // Convert scheduleFor to ISO 8601 format with timezone
      if (payload.scheduleFor) {
        const date = new Date(payload.scheduleFor);
        payload.scheduleFor = date.toISOString();
      }

      const response = await axiosInstance.post(endpoints.ai.generate, payload);
      setAiResult(response.data);
      setAiError(null);

      // Refetch posts after successful generation
      await refetchPosts();
    } catch (error) {
      setAiError(error.message || 'Failed to generate post. Please try again.');
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  };


  const renderPostInput = () => (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        {/* Prompt Input */}
        <Box>
          <Box sx={{ typography: 'subtitle2', mb: 1, color: 'text.primary' }}>
            Post Idea
          </Box>
          <InputBase
            multiline
            fullWidth
            rows={4}
            placeholder="Describe your post idea... (e.g., 'create welcome post with best image that fits company startup')"
            value={postPrompt}
            onChange={(e) => setPostPrompt(e.target.value)}
            disabled={aiLoading}
            inputProps={{ id: 'post-input' }}
            sx={[
              (theme) => ({
                p: 2,
                borderRadius: 1,
                border: `solid 1px ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }),
            ]}
          />
        </Box>

        {/* Professional Settings */}
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {/* Platform Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Platform"
                value={aiFormData.platforms[0]}
                onChange={(e) => handleAiFormChange('platforms', [e.target.value])}
                disabled={aiLoading}
                size="small"
              >
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="twitter">Twitter/X</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
              </TextField>
            </Grid>

            {/* Tone Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Tone"
                value={aiFormData.tone}
                onChange={(e) => handleAiFormChange('tone', e.target.value)}
                disabled={aiLoading}
                size="small"
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="humorous">Humorous</MenuItem>
                <MenuItem value="promotional">Promotional</MenuItem>
              </TextField>
            </Grid>

            {/* Language Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Language"
                value={aiFormData.language}
                onChange={(e) => handleAiFormChange('language', e.target.value)}
                disabled={aiLoading}
                size="small"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </TextField>
            </Grid>

            {/* Max Length */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Length"
                value={aiFormData.maxLength}
                onChange={(e) => handleAiFormChange('maxLength', Math.max(100, parseInt(e.target.value, 10) || 100))}
                disabled={aiLoading}
                size="small"
                inputProps={{ min: 100, max: 1000 }}
              />
            </Grid>
          </Grid>

          {/* Options Checkboxes */}
          <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1, display: 'block' }}>
              Content Options
            </Box>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={aiFormData.includeEmojis}
                    onChange={(e) => handleAiFormChange('includeEmojis', e.target.checked)}
                    disabled={aiLoading}
                    size="small"
                  />
                }
                label="Include Emojis"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={aiFormData.includeHashtags}
                    onChange={(e) => handleAiFormChange('includeHashtags', e.target.checked)}
                    disabled={aiLoading}
                    size="small"
                  />
                }
                label="Include Hashtags"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={aiFormData.includeImage}
                    onChange={(e) => handleAiFormChange('includeImage', e.target.checked)}
                    disabled={aiLoading}
                    size="small"
                  />
                }
                label="Include Image"
              />
            </Stack>
          </Box>

          {/* Image Style (conditional) */}
          {aiFormData.includeImage && (
            <TextField
              select
              fullWidth
              label="Image Style"
              value={aiFormData.imageStyle}
              onChange={(e) => handleAiFormChange('imageStyle', e.target.value)}
              disabled={aiLoading}
              size="small"
            >
              <MenuItem value="realistic">Realistic</MenuItem>
              <MenuItem value="cartoon">Cartoon</MenuItem>
              <MenuItem value="abstract">Abstract</MenuItem>
              <MenuItem value="minimalist">Minimalist</MenuItem>
            </TextField>
          )}
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <LoadingButton
            variant="contained"
            onClick={handleGeneratePostFromInput}
            loading={aiLoading}
            disabled={!postPrompt.trim() || aiLoading}
            startIcon={<Iconify icon="solar:sparkles-bold" width={20} />}
            sx={{ flex: 1 }}
          >
            Generate Post
          </LoadingButton>
        </Box>

        {/* Error Alert */}
        {aiError && (
          <Alert
            severity="error"
            onClose={() => setAiError(null)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {aiError}
          </Alert>
        )}

        {/* Success Result */}
        {aiResult && aiResult.data && (
          <Box sx={{ p: 2.5, bgcolor: 'success.lighter', borderRadius: 1, border: '1px solid', borderColor: 'success.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.dark' }} />
              <Box sx={{ typography: 'subtitle2', color: 'success.dark' }}>
                Post generated successfully!
              </Box>
            </Box>
            <Stack spacing={1.5}>
              {Object.entries(aiResult.data.content || {}).map(([platform, content]) => (
                <Box key={platform} sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 0.75 }}>
                  <Box sx={{ typography: 'caption', fontWeight: 600, color: 'primary.main', mb: 0.75, textTransform: 'capitalize' }}>
                    {platform}
                  </Box>
                  <Box sx={{ typography: 'body2', whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                    {content}
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* Hashtags Section */}
            {aiResult.data.hashtags && aiResult.data.hashtags.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ typography: 'caption', fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                  Suggested Hashtags
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {aiResult.data.hashtags.map((tag) => (
                    <Box
                      key={tag}
                      sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor: 'primary.lighter',
                        borderRadius: 0.5,
                        typography: 'caption',
                        color: 'primary.dark',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="soft"
                onClick={() => {
                  setAiResult(null);
                  setPostPrompt('');
                }}
                disabled={aiLoading}
                sx={{ flex: 1 }}
              >
                Create Another
              </Button>
              <LoadingButton
                variant="contained"
                onClick={handleGeneratePostFromInput}
                disabled={!postPrompt.trim() || aiLoading}
                sx={{ flex: 1 }}
              >
                Publish Post
              </LoadingButton>
            </Box>
          </Box>
        )}
      </Stack>
    </Card>
  );

  const renderAiDialog = () => (
    <Dialog open={openAiDialog} onClose={handleCloseAiDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Post with AI</DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {aiError && <Alert severity="error">{aiError}</Alert>}

          {aiResult && (
            <Alert severity="success">
              Post generated successfully! Content preview available below.
            </Alert>
          )}

          {!aiResult && (
            <>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Prompt (Optional)"
                placeholder="Describe the post you want to generate... or leave blank for quick generation"
                value={aiFormData.prompt}
                onChange={(e) => handleAiFormChange('prompt', e.target.value)}
                disabled={aiLoading}
              />

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={aiFormData.includeEmojis}
                      onChange={(e) => handleAiFormChange('includeEmojis', e.target.checked)}
                      disabled={aiLoading}
                    />
                  }
                  label="Include Emojis"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={aiFormData.includeHashtags}
                      onChange={(e) => handleAiFormChange('includeHashtags', e.target.checked)}
                      disabled={aiLoading}
                    />
                  }
                  label="Include Hashtags"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={aiFormData.includeImage}
                      onChange={(e) => handleAiFormChange('includeImage', e.target.checked)}
                      disabled={aiLoading}
                    />
                  }
                  label="Include Image"
                />
              </Stack>

              <TextField
                select
                fullWidth
                label="Tone"
                value={aiFormData.tone}
                onChange={(e) => handleAiFormChange('tone', e.target.value)}
                disabled={aiLoading}
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="humorous">Humorous</MenuItem>
                <MenuItem value="promotional">Promotional</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Language"
                value={aiFormData.language}
                onChange={(e) => handleAiFormChange('language', e.target.value)}
                disabled={aiLoading}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </TextField>

              <TextField
                fullWidth
                type="number"
                label="Max Length"
                value={aiFormData.maxLength}
                onChange={(e) => handleAiFormChange('maxLength', parseInt(e.target.value, 10))}
                disabled={aiLoading}
                inputProps={{ min: 100, max: 1000 }}
              />

              <TextField
                fullWidth
                type="datetime-local"
                label="Schedule For (Optional)"
                value={aiFormData.scheduleFor || ''}
                onChange={(e) => handleAiFormChange('scheduleFor', e.target.value || null)}
                disabled={aiLoading}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </>
          )}

          {aiResult && aiResult.data && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ typography: 'subtitle2', mb: 1 }}>Generated Content:</Box>
                  {Object.entries(aiResult.data.content || {}).map(([platform, content]) => (
                    <Box key={platform} sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 0.5 }}>
                      <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 0.5 }}>
                        {platform}
                      </Box>
                      <Box sx={{ typography: 'body2', whiteSpace: 'pre-wrap' }}>{content}</Box>
                    </Box>
                  ))}
                </Box>

                {aiResult.data.hashtags && aiResult.data.hashtags.length > 0 && (
                  <Box>
                    <Box sx={{ typography: 'subtitle2', mb: 1 }}>Hashtags:</Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {aiResult.data.hashtags.map((tag) => (
                        <Box
                          key={tag}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            bgcolor: 'primary.lighter',
                            borderRadius: 0.5,
                            typography: 'caption',
                            color: 'primary.dark',
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {aiResult ? (
          <>
            <Button onClick={handleCloseAiDialog}>Close</Button>
            <Button variant="contained" onClick={handleOpenAiDialog}>
              Generate Another
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleCloseAiDialog} disabled={aiLoading}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              onClick={handleGeneratePost}
              loading={aiLoading}
            >
              Generate
            </LoadingButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );


  const handlePageChange = (event, newPage) => {
    // Scroll to posts section smoothly
    const postsSection = document.querySelector('[data-posts-section]');
    if (postsSection) {
      postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Update the page number to trigger fetch
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const renderPostSkeleton = () => (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={20} />
            <Skeleton variant="text" width="20%" height={16} />
          </Stack>
        </Box>

        {/* Content Skeleton */}
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="95%" height={20} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1.5 }} />

        {/* Actions Skeleton */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="text" width="15%" height={20} />
          <Skeleton variant="text" width="15%" height={20} />
          <Skeleton variant="text" width="15%" height={20} />
        </Box>
      </Stack>
    </Card>
  );

  const renderPosts = () => {
    if (postsLoading) {
      return (
        <Stack spacing={3}>
          {[...Array(3)].map((_, index) => (
            <div key={index}>{renderPostSkeleton()}</div>
          ))}
        </Stack>
      );
    }

    if (!postsData.length) {
      return (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Iconify icon="solar:document-empty-bold" width={64} sx={{ mx: 'auto', mb: 2, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No posts yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Start creating posts to see them here
          </Typography>
        </Card>
      );
    }

    return (
      <Stack spacing={3}>
        {postsData.map((post) => (
          <ProfilePostItem key={post.id} post={post} />
        ))}
      </Stack>
    );
  };

  const renderPagination = () => {
    if (!postsData.length || pagination.totalPages <= 1) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, pb: 2 }}>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
          size="medium"
          showFirstButton
          showLastButton
        />
      </Box>
    );
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {renderFollows()}
            {renderAbout()}
            {renderSocials()}
          </Stack>
        </Grid> */}

        <Grid size={{ xs: 12 }}>
          <Stack spacing={3}>
            {renderPostInput()}

            {/* Posts Section Header */}
            <Box data-posts-section sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Iconify icon="solar:library-bold" width={24} />
              <Typography variant="h6">
                Your Posts
                {pagination.totalItems > 0 && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({pagination.totalItems})
                  </Typography>
                )}
              </Typography>
            </Box>

            {/* Posts List */}
            {renderPosts()}

            {/* Pagination */}
            {renderPagination()}
          </Stack>
        </Grid>
      </Grid>

      {renderAiDialog()}
    </>
  );
}
