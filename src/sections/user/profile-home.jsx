import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputBase from '@mui/material/InputBase';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

import { ProfilePostItem } from './profile-post-item';

// ----------------------------------------------------------------------

export function ProfileHome({ info, posts }) {
  const [postPrompt, setPostPrompt] = useState('');
  const [openAiDialog, setOpenAiDialog] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
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
    } catch (error) {
      setAiError(error.message || 'Failed to generate post. Please try again.');
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  };


  const renderPostInput = () => (
    <Card sx={{ p: 3 }}>
      <InputBase
        multiline
        fullWidth
        rows={4}
        placeholder="Generate your post idea..."
        value={postPrompt}
        onChange={(e) => setPostPrompt(e.target.value)}
        disabled={aiLoading}
        inputProps={{ id: 'post-input' }}
        sx={[
          (theme) => ({
            p: 2,
            mb: 2,
            borderRadius: 1,
            border: `solid 1px ${theme.palette.divider}`,
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
            },
          }),
        ]}
      />

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
        <Button
          variant="outlined"
          onClick={handleOpenAiDialog}
          disabled={aiLoading}
        >
          More Options
        </Button>
      </Box>

      {aiError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {aiError}
        </Alert>
      )}

      {aiResult && aiResult.data && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
          <Box sx={{ typography: 'subtitle2', mb: 1.5, color: 'success.dark' }}>
            Post generated successfully!
          </Box>
          <Stack spacing={1.5}>
            {Object.entries(aiResult.data.content || {}).map(([platform, content]) => (
              <Box key={platform} sx={{ p: 1.5, bgcolor: 'white', borderRadius: 0.5 }}>
                <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 0.5 }}>
                  {platform}
                </Box>
                <Box sx={{ typography: 'body2', whiteSpace: 'pre-wrap' }}>{content}</Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
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
                slotProps={{
                  htmlSelect: {
                    children: [
                      <option key="professional" value="professional">
                        Professional
                      </option>,
                      <option key="casual" value="casual">
                        Casual
                      </option>,
                      <option key="playful" value="playful">
                        Playful
                      </option>,
                      <option key="inspiring" value="inspiring">
                        Inspiring
                      </option>,
                    ],
                  },
                }}
              />

              <TextField
                select
                fullWidth
                label="Language"
                value={aiFormData.language}
                onChange={(e) => handleAiFormChange('language', e.target.value)}
                disabled={aiLoading}
                slotProps={{
                  htmlSelect: {
                    children: [
                      <option key="en" value="en">
                        English
                      </option>,
                      <option key="es" value="es">
                        Spanish
                      </option>,
                      <option key="fr" value="fr">
                        French
                      </option>,
                      <option key="de" value="de">
                        German
                      </option>,
                    ],
                  },
                }}
              />

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
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ typography: 'subtitle2', mb: 1 }}>Generated Content:</Box>
                  {Object.entries(aiResult.data.content || {}).map(([platform, content]) => (
                    <Box key={platform} sx={{ mb: 1.5, p: 1.5, bgcolor: 'white', borderRadius: 0.5 }}>
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

            {posts.map((post) => (
              <ProfilePostItem key={post.id} post={post} />
            ))}
          </Stack>
        </Grid>
      </Grid>

      {renderAiDialog()}
    </>
  );
}
