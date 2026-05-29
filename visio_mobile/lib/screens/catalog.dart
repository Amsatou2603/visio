import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  _CatalogScreenState createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  List<dynamic> _products = [];
  bool _loading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _loading = true);
    try {
      final products = await Api.fetchProducts();
      print('Loaded ${products.length} products');
      setState(() {
        _products = products;
        _loading = false;
      });
    } catch (e) {
      print('Error loading products: $e');
      setState(() => _loading = false);
    }
  }

  void _performSearch(String query) {
    setState(() {
      _searchQuery = query.toLowerCase();
    });
  }

  List<dynamic> get _filteredProducts {
    if (_searchQuery.isEmpty) return _products;
    return _products.where((p) {
      final name = (p['name'] ?? '').toLowerCase();
      final brand = (p['brand'] ?? '').toLowerCase();
      return name.contains(_searchQuery) || brand.contains(_searchQuery);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor =
        isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;
    final secondaryTextColor =
        isDark ? AppTheme.darkTextSecondary : AppTheme.lightTextSecondary;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Catalogue',
          style: GoogleFonts.syne(
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              showSearch(
                context: context,
                delegate: _ProductSearchDelegate(_products),
              );
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _filteredProducts.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.inventory_2_outlined,
                          size: 64, color: secondaryTextColor),
                      const SizedBox(height: 16),
                      Text(
                        _searchQuery.isEmpty
                            ? 'Aucun produit disponible'
                            : 'Aucun résultat pour "$_searchQuery"',
                        style: GoogleFonts.dmSans(color: secondaryTextColor),
                      ),
                    ],
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.68,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: _filteredProducts.length,
                  itemBuilder: (context, i) {
                    final p = _filteredProducts[i];
                    return _ProductCard(product: p);
                  },
                ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}

class _ProductSearchDelegate extends SearchDelegate<String> {
  final List<dynamic> products;

  _ProductSearchDelegate(this.products);

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
        },
      ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, '');
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    final filtered = products.where((p) {
      final name = (p['name'] ?? '').toLowerCase();
      final brand = (p['brand'] ?? '').toLowerCase();
      return name.contains(query.toLowerCase()) || brand.contains(query.toLowerCase());
    }).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Text(
          'Aucun résultat pour "$query"',
          style: GoogleFonts.dmSans(),
        ),
      );
    }

    return ListView.builder(
      itemCount: filtered.length,
      itemBuilder: (context, i) {
        final p = filtered[i];
        return ListTile(
          title: Text(p['name'] ?? 'Produit'),
          subtitle: Text(p['brand'] ?? ''),
          trailing: Text('${p['price']} XOF'),
          onTap: () {
            close(context, '');
            Navigator.pushNamed(context, '/product/${p['id']}');
          },
        );
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    final suggestions = products.where((p) {
      final name = (p['name'] ?? '').toLowerCase();
      final brand = (p['brand'] ?? '').toLowerCase();
      return name.contains(query.toLowerCase()) || brand.contains(query.toLowerCase());
    }).toList();

    return ListView.builder(
      itemCount: suggestions.length,
      itemBuilder: (context, i) {
        final p = suggestions[i];
        return ListTile(
          title: Text(p['name'] ?? 'Produit'),
          subtitle: Text(p['brand'] ?? ''),
          trailing: Text('${p['price']} XOF'),
          onTap: () {
            query = p['name'] ?? '';
            showResults(context);
          },
        );
      },
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;

  const _ProductCard({required this.product});

  String _getConditionLabel(String? condition) {
    switch (condition) {
      case 'new':
        return 'Neuf';
      case 'refurbished':
        return 'Reconditionné';
      case 'used':
        return 'Occasion';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor =
        isDark ? AppTheme.darkTextPrimary : AppTheme.lightTextPrimary;
    final secondaryTextColor =
        isDark ? AppTheme.darkTextSecondary : AppTheme.lightTextSecondary;

    final condition = _getConditionLabel(product['condition']);
    final price = product['price'] ?? 0;
    final oldPrice = product['old_price'];
    final discountPercent = oldPrice != null && oldPrice > price
        ? ((oldPrice - price) / oldPrice * 100).toInt()
        : 0;
    final inStock = (product['stock'] ?? 0) > 0;

    return GlassCard(
      onTap: () => Navigator.pushNamed(
        context,
        '/product/${product['id']}',
      ),
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product image
          Expanded(
            flex: 3,
            child: Stack(
              children: [
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppTheme.darkBackgroundSoft
                        : AppTheme.lightBackgroundSoft,
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: product['image'] != null
                      ? Image.network(
                          product['image'],
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.phone_android,
                                      size: 48, color: secondaryTextColor),
                                  const SizedBox(height: 8),
                                  Text(
                                    product['name'] ?? 'Produit',
                                    style: GoogleFonts.dmSans(
                                      fontSize: 12,
                                      color: secondaryTextColor,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            );
                          },
                        )
                      : Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.phone_android,
                                  size: 48, color: secondaryTextColor),
                              const SizedBox(height: 8),
                              Text(
                                product['name'] ?? 'Produit',
                                style: GoogleFonts.dmSans(
                                  fontSize: 12,
                                  color: secondaryTextColor,
                                ),
                                textAlign: TextAlign.center,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                ),
                // Brand badge
                if (product['brand'] != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        product['brand'],
                        style: GoogleFonts.syne(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ),
                // Discount badge
                if (discountPercent > 0)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '-$discountPercent%',
                        style: GoogleFonts.syne(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Product info
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product['name'] ?? 'Produit',
                        style: GoogleFonts.dmSans(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: textColor,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (condition.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            condition,
                            style: GoogleFonts.dmSans(
                              fontSize: 11,
                              color: secondaryTextColor,
                            ),
                          ),
                        ),
                      // Rating
                      if (product['average_rating'] != null &&
                          product['reviews_count'] != null &&
                          product['reviews_count'] > 0)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Row(
                            children: [
                              const Icon(Icons.star,
                                  size: 12, color: Colors.amber),
                              const SizedBox(width: 4),
                              Text(
                                '${product['average_rating']} (${product['reviews_count']})',
                                style: GoogleFonts.dmSans(
                                  fontSize: 11,
                                  color: secondaryTextColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (oldPrice != null && oldPrice > price)
                        Text(
                          '$oldPrice XOF',
                          style: GoogleFonts.dmSans(
                            fontSize: 11,
                            color: secondaryTextColor,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      Text(
                        '$price XOF',
                        style: GoogleFonts.syne(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primary,
                        ),
                      ),
                      if (!inStock)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            'Rupture de stock',
                            style: GoogleFonts.dmSans(
                              fontSize: 10,
                              color: Colors.red,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
