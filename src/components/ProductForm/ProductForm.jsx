import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styles from './ProductForm.module.css';

export default function ProductForm({
  initialData = null,
  onSubmit,
  loading = false,
  isEditing = false,
}) {
  const navigate = useNavigate();
  const [imageMode, setImageMode] = useState('url'); // 'upload' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      productName: '',
      storeName: '',
      price: 0,
      currency: 'USD',
      quantity: 0,
      affiliateLink: '',
      category: '',
      subCategory: '',
      productDetail: '',
      bulletPoints: [''],
      specifications: [{ key: '', value: '' }],
      brand: '',
      rating: 0,
      reviewCount: 0,
      isAmazonChoice: false,
      shippingInfo: '',
      returnPolicy: '',
      isActive: true,
      productImage: '',
    },
  });

  const {
    fields: bulletFields,
    append: appendBullet,
    remove: removeBullet,
  } = useFieldArray({
    control,
    name: 'bulletPoints',
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: 'specifications',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        bulletPoints: initialData.bulletPoints || [''],
        specifications: initialData.specifications || [{ key: '', value: '' }],
      });
      // Load tags
      if (initialData.tags && Array.isArray(initialData.tags)) {
        setTags(initialData.tags);
      } else if (initialData.tags && typeof initialData.tags === 'string') {
        setTags(initialData.tags.split(',').map(t => t.trim()).filter(t => t));
      }
      if (initialData.productImage && initialData.productImage.includes('firebasestorage')) {
        setImageMode('upload');
        setImagePreview(initialData.productImage);
      } else if (initialData.productImage) {
        setImagePreview(initialData.productImage);
      }
    }
  }, [initialData, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImagePreview(url);
  };

  const handleModeChange = (mode) => {
    setImageMode(mode);
    setSelectedFile(null);
    // Keep the preview if switching to URL mode and there's an existing image
    if (mode === 'url' && !initialData?.productImage) {
      setImagePreview('');
      setValue('productImage', '');
    }
    if (mode === 'upload' && !initialData?.productImage) {
      setImagePreview('');
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setValue('productImage', '');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data) => {
    try {
      // Filter out empty bullet points and specifications
      const filteredBullets = data.bulletPoints.filter((bp) => bp.trim());
      const filteredSpecs = data.specifications.filter(
        (spec) => spec.key.trim() && spec.value.trim()
      );

      let imageUrl = '';

      // Handle image upload based on mode
      if (imageMode === 'upload' && selectedFile) {
        // Upload file to Firebase Storage
        const productId = initialData?.id || Date.now().toString();
        imageUrl = await onSubmit.uploadImage(productId, selectedFile);
      } else if (imageMode === 'url' && data.productImage) {
        // Use the URL directly from form
        imageUrl = data.productImage;
      } else if (initialData?.productImage && !selectedFile) {
        // Keep existing image if editing and no new image selected
        imageUrl = initialData.productImage;
      }

      const productData = {
        ...data,
        tags: tags,
        bulletPoints: filteredBullets,
        specifications: filteredSpecs,
        productImage: imageUrl,
        price: Number(data.price),
        quantity: Number(data.quantity),
        rating: Number(data.rating),
        reviewCount: Number(data.reviewCount),
      };

      if (initialData?.id) {
        await onSubmit.update(initialData.id, productData);
      } else {
        await onSubmit.add(productData);
      }

      navigate('/products');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit(onFormSubmit)} className={styles.form}>
      {/* Basic Info Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Basic Information</h3>

        {/* Image Upload Mode Toggle */}
        <div className={styles.formGroup}>
          <label className="form-label">Product Image</label>
          <div className={styles.pillSwitcher}>
            <button
              type="button"
              className={imageMode === 'url' ? styles.active : ''}
              onClick={() => handleModeChange('url')}
            >
              Image URL
            </button>
            <button
              type="button"
              className={imageMode === 'upload' ? styles.active : ''}
              onClick={() => handleModeChange('upload')}
            >
              Upload Image
            </button>
          </div>
        </div>

        {imageMode === 'url' ? (
          <div className={styles.formGroup}>
            <label className="form-label">Image URL</label>
            <input
              type="url"
              className={`input-field ${errors.productImage ? 'error' : ''}`}
              placeholder="https://example.com/image.png"
              {...register('productImage', {
                onChange: handleImageUrlChange,
                validate: (value) => {
                  if (!value) return true; // Optional
                  try {
                    new URL(value);
                    return true;
                  } catch {
                    return 'Invalid URL format';
                  }
                },
              })}
            />
            {errors.productImage && (
              <p className="text-error">{errors.productImage.message}</p>
            )}
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className="form-label">Upload Image File</label>
            <div className={styles.fileUploadContainer}>
              <input
                type="file"
                accept="image/*"
                id="fileUpload"
                className={styles.fileInputHidden}
                onChange={handleFileChange}
              />
              <label htmlFor="fileUpload" className={styles.fileUploadBtn}>
                Choose File
              </label>
              <span className={styles.fileName}>
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className={styles.imagePreviewContainer}>
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="Preview" />
            </div>
            <button
              type="button"
              className={styles.removeImageBtn}
              onClick={removeImage}
            >
              × Remove
            </button>
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className={`input-field ${errors.productName ? 'error' : ''}`}
              placeholder="Enter product name"
              {...register('productName', { required: 'Product name is required' })}
            />
            {errors.productName && (
              <p className="text-error">{errors.productName.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className="form-label">Store Name *</label>
            <input
              type="text"
              className={`input-field ${errors.storeName ? 'error' : ''}`}
              placeholder="Enter store name"
              {...register('storeName', { required: 'Store name is required' })}
            />
            {errors.storeName && (
              <p className="text-error">{errors.storeName.message}</p>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className="form-label">Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`input-field ${errors.price ? 'error' : ''}`}
              placeholder="0.00"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' },
              })}
            />
            {errors.price && <p className="text-error">{errors.price.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className="form-label">Currency *</label>
            <select
              className={`input-field ${errors.currency ? 'error' : ''}`}
              {...register('currency', { required: 'Currency is required' })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="PKR">PKR</option>
            </select>
            {errors.currency && (
              <p className="text-error">{errors.currency.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              min="0"
              className={`input-field ${errors.quantity ? 'error' : ''}`}
              placeholder="0"
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity must be positive' },
              })}
            />
            {errors.quantity && (
              <p className="text-error">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className="form-label">Affiliate Link *</label>
          <input
            type="url"
            className={`input-field ${errors.affiliateLink ? 'error' : ''}`}
            placeholder="https://amazon.com/product/..."
            {...register('affiliateLink', {
              required: 'Affiliate link is required',
              validate: (value) => {
                try {
                  new URL(value);
                  return true;
                } catch {
                  return 'Invalid URL format';
                }
              },
            })}
          />
          {errors.affiliateLink && (
            <p className="text-error">{errors.affiliateLink.message}</p>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className="form-label">Category</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Electronics"
              {...register('category')}
            />
          </div>

          <div className={styles.formGroup}>
            <label className="form-label">Sub-Category</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Headphones"
              {...register('subCategory')}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className="form-label">Tags</label>
          <div className={styles.tagsContainer} onClick={() => tagInputRef.current?.focus()}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              type="text"
              className={styles.tagInput}
              placeholder={tags.length === 0 ? "Type and press Enter to add tags" : "Add more tags..."}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Product Description Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Product Description</h3>

        <div className={styles.formGroup}>
          <label className="form-label">Product Details</label>
          <textarea
            className="input-field"
            placeholder="Enter product description..."
            rows={5}
            {...register('productDetail')}
          />
        </div>

        <div className={styles.formGroup}>
          <label className="form-label">Bullet Points</label>
          {bulletFields.map((field, index) => (
            <div key={field.id} className={styles.dynamicRow}>
              <input
                type="text"
                className="input-field"
                placeholder={`Bullet point ${index + 1}`}
                {...register(`bulletPoints.${index}`)}
              />
              {bulletFields.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeBullet(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => appendBullet('')}
          >
            + Add Bullet
          </button>
        </div>
      </div>

      <div className="divider"></div>

      {/* Specifications Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Specifications</h3>

        {specFields.map((field, index) => (
          <div key={field.id} className={styles.dynamicRow}>
            <input
              type="text"
              className="input-field"
              placeholder="Key"
              {...register(`specifications.${index}.key`)}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Value"
              {...register(`specifications.${index}.value`)}
            />
            {specFields.length > 1 && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeSpec(index)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => appendSpec({ key: '', value: '' })}
        >
          + Add Spec
        </button>
      </div>

      <div className="divider"></div>

      {/* Amazon Metadata Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Amazon Metadata</h3>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className="form-label">Brand</label>
            <input
              type="text"
              className="input-field"
              placeholder="Brand name"
              {...register('brand')}
            />
          </div>

          <div className={styles.formGroup}>
            <label className="form-label">Rating (0-5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="input-field"
              placeholder="4.5"
              {...register('rating', {
                min: { value: 0, message: 'Minimum rating is 0' },
                max: { value: 5, message: 'Maximum rating is 5' },
              })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className="form-label">Review Count</label>
            <input
              type="number"
              min="0"
              className="input-field"
              placeholder="1234"
              {...register('reviewCount')}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.toggleLabel}>
            <span>Amazon's Choice</span>
            <label className="toggle-switch">
              <input type="checkbox" {...register('isAmazonChoice')} />
              <span className="toggle-slider"></span>
            </label>
          </label>
        </div>

        <div className={styles.formGroup}>
          <label className="form-label">Shipping Info</label>
          <input
            type="text"
            className="input-field"
            placeholder="Free shipping on orders over $25"
            {...register('shippingInfo')}
          />
        </div>

        <div className={styles.formGroup}>
          <label className="form-label">Return Policy</label>
          <input
            type="text"
            className="input-field"
            placeholder="30-day return policy"
            {...register('returnPolicy')}
          />
        </div>
      </div>

      <div className="divider"></div>

      {/* Visibility Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Visibility</h3>

        <div className={styles.formGroup}>
          <label className={styles.toggleLabel}>
            <span>Active Product</span>
            <label className="toggle-switch">
              <input type="checkbox" {...register('isActive')} />
              <span className="toggle-slider"></span>
            </label>
          </label>
        </div>
      </div>

      <div className="divider"></div>

      {/* Submit Buttons */}
      <div className={styles.formActions}>
        <button type="button" className="btn-secondary" onClick={() => navigate('/products')}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner"></div>
              {isEditing ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>{isEditing ? 'Update Product' : 'Add Product'}</>
          )}
        </button>
      </div>
    </form>
  );
}
